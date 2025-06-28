import os
import re
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# 기본 URL
BASE_LIST_URL = 'https://tour.chungbuk.go.kr/www/selectTourCntntsList.do'
BASE_DETAIL_URL = 'https://tour.chungbuk.go.kr'

# 이미지 다운로드 함수
def download_image(img_url, save_dir, filename=None):
    os.makedirs(save_dir, exist_ok=True)
    try:
        resp = requests.get(img_url, stream=True)
        resp.raise_for_status()
        ext = os.path.splitext(img_url)[1].split('?')[0] or '.jpg'
        filename = filename or os.path.basename(img_url).split('?')[0]
        save_path = os.path.join(save_dir, filename)

        with open(save_path, 'wb') as f:
            for chunk in resp.iter_content(1024):
                f.write(chunk)
        return save_path
    except Exception as e:
        print(f"[실패] 이미지 다운로드 오류: {img_url} → {e}")
        return None

# 카페 정보 파싱 함수
def parse_info_box(info_box, food_no=None):
    def sanitize_filename(name):
        return re.sub(r'[\\/*?:"<>|()\s]+', '_', name).strip('_')

    data = {}

    # 1) 이미지 목록
    images = []
    img_list = info_box.select_one('div.info_top.clearfix div.img_list')
    if img_list:
        for idx, item in enumerate(img_list.select('div.img_item')):
            img_box = item.select_one('div.image')
            if not img_box:
                continue
            style = img_box.get('style', '')
            match = re.search(r"url\(['\"]?(.*?)['\"]?\)", style)
            rel_path = match.group(1) if match else ''
            abs_url = urljoin(BASE_DETAIL_URL, rel_path)
            alt_el = img_box.select_one('span.skip')
            alt = alt_el.get_text(strip=True) if alt_el else ''

            # 파일명 지정: food_no_0.jpg 등
            if not food_no:
                continue
            filename = f"{sanitize_filename(food_no)}_{idx}.jpg"
            local_path = download_image(abs_url, "downloaded_images_food", filename)

            images.append({'url': abs_url, 'alt': alt, 'local_path': local_path})
    data['images'] = images

    # 2) 정보 테이블
    table_box = info_box.select_one('div.table_box table')
    if table_box:
        table = {'caption': '', 'rows': []}
        cap = table_box.select_one('caption')
        if cap:
            table['caption'] = cap.get_text(strip=True)

        for tr in table_box.select('tbody > tr'):
            th = tr.select_one('th')
            td = tr.select_one('td')
            key = th.get_text(strip=True) if th else ''
            raw = td.get_text(separator='\n') if td else ''
            raw = raw.replace('\t', '\n')
            parts = [p.strip() for p in re.split(r'[\n]+', raw) if p.strip()]
            unique_parts = list(dict.fromkeys(parts))
            value = unique_parts[0] if len(unique_parts) == 1 else unique_parts
            table['rows'].append({'항목': key, '내용': value})
        data['info_table'] = table

    # 3) 소개
    intro_header = info_box.find('h4', string=re.compile(r'소개'))
    if intro_header:
        para = intro_header.find_next_sibling('p')
        if para:
            raw = para.get_text(separator='\n')
            lines = [line.strip() for line in raw.split('\n') if line.strip()]
            data['introduction'] = lines

    return data

# 메인 크롤링 함수
def scrape_structured_info(start_page: int, end_page: int, items_per_page: int = 12):
    results = []

    for page in range(start_page, end_page + 1):
        params = {
            'key': '77',
            'searchMainSe': 'FOOD',
            'searchTourSe': ['01', '02', '03', '05'],  # 여러 카테고리
            'pageUnit': 12,
            'searchAreaSe': '',
            'searchKrwd': '',
            'pageIndex': page,
        }

        resp = requests.get(BASE_LIST_URL, params=params)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')

        items = soup.find_all('div', class_='tourist_item')
        if not items:
            break

        for item in items[:items_per_page]:
            a_tag = item.find('a', href=True)
            if not a_tag:
                continue
            detail_url = urljoin(BASE_DETAIL_URL, a_tag['href'])

            detail_resp = requests.get(detail_url)
            detail_resp.raise_for_status()
            detail_soup = BeautifulSoup(detail_resp.text, 'html.parser')

            info_box = detail_soup.find('div', class_='info_box')
            if not info_box:
                continue

            food_no_match = re.search(r"tourNo=(\d+)", detail_url)
            food_no = food_no_match.group(1) if food_no_match else None

            parsed = parse_info_box(info_box, food_no=food_no)
            parsed['food_no'] = food_no
            parsed['detail_url'] = detail_url
            results.append(parsed)

    return results

# 실행 구문
if __name__ == '__main__':
    START_PAGE = 1
    END_PAGE = 30  # 최대 145 페이지
    ITEMS_PER_PAGE = 1

    data = scrape_structured_info(START_PAGE, END_PAGE, ITEMS_PER_PAGE)

    with open('chungbuk_food.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"총 {len(data)}개의 구조화된 정보가 'chungbuk_food.json'에 저장되었습니다.")
