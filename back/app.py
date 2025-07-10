# app.py

import os
import json
import re
import numpy as np
import faiss
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.preprocessing import normalize
from openai import OpenAI
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()
client = OpenAI()
DIM = 1536

app = Flask(__name__)
CORS(app)

DATA_FILES = {
    "stay": "chungbuk_stay.json",
    "food": "chungbuk_food.json",
    "program": "chungbuk_program.json",
    "cafe": "chungbuk_cafe.json"
}

TOUR_KEYS = {
    "stay": "stay",
    "food": "food",
    "program": "program",
    "cafe": "cafe"
}

def embed_text(text: str) -> np.ndarray:
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=[text]
    )
    vec = np.array(response.data[0].embedding, dtype=np.float32)
    return normalize(vec.reshape(1, -1))[0]

def build_indices():
    indices = {}
    metadatas = {}

    for cat, path in DATA_FILES.items():
        with open(path, encoding="utf-8") as f:
            data = json.load(f)

        embeddings = []
        metadata = []

        for rec in data:
            title = rec.get("info_table", {}).get("caption", [])
            name = title.split(" - ")[0] if title else ""
            intro = rec.get("introduction", [])
            intro_text = " ".join(intro) if isinstance(intro, list) else str(intro)
            full_text = f"{name} {intro_text}"

            meta = {
                "name": name,
                "intro": intro_text,
                "full": rec
            }
            metadata.append(meta)
            embeddings.append(embed_text(full_text))

        index = faiss.IndexFlatIP(DIM)
        index.add(np.vstack(embeddings))
        indices[cat] = index
        metadatas[cat] = metadata

    return indices, metadatas

def request_recommendations(profile_text, candidates, count=3):
    prompt = (
        "당신은 대한민국 지역 여행지 추천 도우미입니다.\n"
        "다음은 사용자의 워케이션 목적 정보입니다:\n"
        f"{profile_text}\n\n"
        f"아래 후보들 중에서 각 카테고리별로 {count}개 장소를 추천해주세요.\n"
        "추천하는 장소는 사용자 목적, 동행자, 이동수단, 연령, 성별과 관련이 있어야 하며,\n"
        "이유는 명확하고 구체적이어야 합니다.\n"
        "JSON 형식으로 아래와 같이 응답하세요:\n"
        "{\n"
        "  \"stay\": [{\"name\": 장소명, \"reason\": 추천이유 }, ...],\n"
        "  \"food\": [...], \"program\": [...], \"cafe\": [...]\n"
        "}\n\n"
    )
    for cat, items in candidates.items():
        filtered = [
            {
                "name": i["name"],
                "intro": i["intro"][:300]
            } for i in items
        ]
        prompt += f"{cat} 후보들:\n{json.dumps(filtered, ensure_ascii=False)}\n"

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "너는 입력 정보를 바탕으로 장소를 이유와 함께 추천하는 AI 도우미야."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.6,
        max_tokens=1200
    )

    text = response.choices[0].message.content.strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.DOTALL)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        print("[오류] GPT 응답 파싱 실패:", text)
        return {}

def recommend(user_profile, categories, count=3):
    profile_text = (
        f"{user_profile['age_group']} {user_profile['gender']} 사용자, "
        f"목적: {user_profile['purpose']}, "
        f"동행자: {user_profile['companions']}, "
        f"교통수단: {user_profile['transport']}, "
        f"어느지역: {user_profile['location']}, "
        f"스타일: {user_profile['what']}"
    )
    profile_vec = embed_text(profile_text)
    indices, metadatas = build_indices()

    candidates = {}
    for cat in categories:
        D, I = indices[cat].search(profile_vec.reshape(1, -1), 20)
        candidates[cat] = [metadatas[cat][i] for i in I[0]]

    return request_recommendations(profile_text, candidates, count)

def extract_full_data_with_reason(rec_map):
    result = {}
    for cat, items in rec_map.items():
        name_to_reason = {i['name']: i['reason'] for i in items}
        with open(DATA_FILES[cat], encoding="utf-8") as f:
            data = json.load(f)
        matched = []
        for r in data:
            caption = r.get("info_table", {}).get("caption", "")
            name = caption.split(" - ")[0] if caption else ""
            if name in name_to_reason:
                r_copy = r.copy()
                r_copy["recommend_reason"] = name_to_reason[name]
                matched.append(r_copy)
        result[cat] = matched
    return result

@app.route("/api/recommend", methods=["POST"])
def recommend_api():
    try:
        user_profile = request.get_json()
        categories = ["stay", "food", "program", "cafe"]
        rec_result = recommend(user_profile, categories, count=3)  # GPT 요약 결과
        return jsonify(rec_result)  # ✅ 원본 GPT 결과만 응답
    except Exception as e:
        print("[ERROR]", e)
        return jsonify({"error": "추천 생성 중 오류 발생"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
