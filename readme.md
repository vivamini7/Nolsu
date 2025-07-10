## 2025년 인공지능 융합 정책발굴 해커톤 (장려상)

### 소개
워케이션을 위한 활동 추천 웹 애플리케이션입니다.  
사용자의 선호와 설문 결과를 기반으로 OpenAI 모델을 활용한 활동 추천을 제공하며,  
백엔드는 Flask, 프론트엔드는 React로 구성되어 있습니다. 또한 데이터 크롤링을 통해 활동 추천에 필요한 데이터를 사전에 수집·정제하였습니다.

---

## 📁 폴더 구조
```
Nolsu/
├── backend/ # Flask 기반 백엔드 서버\\
│ ├── app.py
│ ├── requirements.txt
│ └── ...
├── frontend/ # React 기반 프론트엔드 앱
│ ├── src/
│ ├── public/
│ └── ...
├── .gitignore
└── README.md
```

## 🛠️ 실행 방법

### 1. 데이터 크롤링
- 본 프로젝트는 사전 데이터 크롤링 및 정제를 완료한 상태입니다.
- 크롤링된 데이터는 백엔드에서 OpenAI 응답 생성을 위한 기반 데이터로 사용됩니다.

### 2. 백엔드 실행 (Flask + OpenAI API 연동)

```bash
cd back
pip install -r requirements.txt
python app.py

🔐 .env 파일에 OpenAI API 키가 필요합니다.
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 프론트엔드 실행 (React)
```bash
cd frontend
npm install
npm start
```

### 프로젝트 소개 
![Main](assets/main.jpg)

### 주요 기능
![Detail](assets/1.jpg)
![Detail](assets/2.jpg)
![Detail](assets/3.jpg)
![Detail](assets/4.jpg)    
![Detail](assets/5.jpg)
