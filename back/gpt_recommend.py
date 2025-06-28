import os
import json
import re
import numpy as np
import faiss
from sklearn.preprocessing import normalize
from openai import OpenAI
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()
client = OpenAI()
DIM = 1536

# 데이터 파일과 고유 ID 키
DATA_FILES = {
    "stay": "chungbuk_stay.json",
    "food": "chungbuk_food.json",
    "program": "chungbuk_program.json",
    "cafe": "chungbuk_cafe.json"
}

TOUR_KEYS = {
    "stay": "stay_no",
    "food": "food_no",
    "program": "program_no",
    "cafe": "cafe_no"
}

# 사용자 정보
user_profile = {
    "age_group": "20대",                # 연령대
    "gender": "여성",                  # 성별
    "purpose": "자연 속 힐링",         # 어떤 이유로 왔는지
    "companions": "친구 2명",          # 누구와 함께 왔는지
    "transport": "자가용"               # 무엇을 타고 왔는지
}

# 텍스트 임베딩
def embed_text(text: str) -> np.ndarray:
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=[text]
    )
    vec = np.array(response.data[0].embedding, dtype=np.float32)
    return normalize(vec.reshape(1, -1))[0]

# FAISS 인덱스 구축
def build_indices():
    indices = {}
    metadatas = {}

    for cat, path in DATA_FILES.items():
        tour_key = TOUR_KEYS[cat]
        with open(path, encoding="utf-8") as f:
            data = json.load(f)

        embeddings = []
        metadata = []

        for rec in data:
            title = rec.get("info_table", {}).get("rows", [])
            name = title[0]["내용"] if title else ""
            intro = rec.get("introduction", "")
            if isinstance(intro, list):
                intro = intro[0] if intro else ""
            meta = {
                "id": rec.get(tour_key),
                "name": name,
                "intro": intro
            }
            metadata.append(meta)
            embeddings.append(embed_text(f"{name} {intro}"))

        index = faiss.IndexFlatIP(DIM)
        index.add(np.vstack(embeddings))
        indices[cat] = index
        metadatas[cat] = metadata

    return indices, metadatas

# GPT 추천 요청 (이유 포함)
def request_recommendations(profile_text, candidates, count=3):
    prompt = (
        "You are a Korean travel recommendation assistant.\n"
        "The user has the following profile:\n"
        f"{profile_text}\n\n"
        f"From the following candidates in each category, recommend {count} items per category.\n"
        "For each recommendation, explain why it suits the user's profile (age, gender, purpose, companions, transport).\n"
        "Respond ONLY in this JSON format:\n"
        "{\n"
        "  'stay': [{'id': <ID>, 'reason': <추천 이유>}, ...],\n"
        "  'food': [...], 'program': [...], 'cafe': [...]\n"
        "}\n\n"
    )
    for cat, items in candidates.items():
        prompt += f"{cat} candidates:\n{json.dumps(items, ensure_ascii=False)}\n"

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You recommend places based on user profile with clear reasons."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1000
    )

    text = response.choices[0].message.content.strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.DOTALL)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        print("[오류] GPT 응답 파싱 실패:", text)
        return {}


def recommend(user_profile, categories, count=3):
    # 새 필드 다섯 개를 한 문장으로 묶어서 임베딩
    profile_text = (
        f"{user_profile['age_group']} {user_profile['gender']}, "
        f"{user_profile['purpose']} 목적, "
        f"{user_profile['companions']}와 함께, "
        f"{user_profile['transport']} 이용"
    )
    profile_vec = embed_text(profile_text)

    indices, metadatas = build_indices()

    candidates = {}
    for cat in categories:
        D, I = indices[cat].search(profile_vec.reshape(1, -1), 20)
        candidates[cat] = [metadatas[cat][i] for i in I[0]]

    return request_recommendations(profile_text, candidates, count)


# 추천 결과에서 전체 항목과 이유 추출
def extract_full_data_with_reason(rec_map):
    result = {}
    for cat, items in rec_map.items():
        tour_key = TOUR_KEYS[cat]
        id_to_reason = {str(i['id']): i['reason'] for i in items}
        with open(DATA_FILES[cat], encoding="utf-8") as f:
            data = json.load(f)
        matched = []
        for r in data:
            rid = str(r.get(tour_key))
            if rid in id_to_reason:
                r_copy = r.copy()
                r_copy["recommend_reason"] = id_to_reason[rid]
                matched.append(r_copy)
        result[cat] = matched
    return result

# 결과 출력
def print_results(data):
    for cat, items in data.items():
        print(f"\n🔸 {cat.upper()} 추천:")
        for item in items:
            name = item.get("info_table", {}).get("rows", [{}])[0].get("내용", "이름 없음")
            reason = item.get("recommend_reason", "")
            print(f"- {name}: {reason}")

# 실행
if __name__ == "__main__":
    categories = ["stay", "food", "program", "cafe"]
    rec_ids = recommend(user_profile, categories, count=3)
    print("\n✅ GPT 추천 결과 (ID + 이유):")
    print(json.dumps(rec_ids, ensure_ascii=False, indent=2))

    final_data = extract_full_data_with_reason(rec_ids)
    print_results(final_data)

    with open("recommendations_with_reason.json", "w", encoding="utf-8") as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
    print("\n📁 추천 결과가 'recommendations_with_reason.json'에 저장되었습니다.")
