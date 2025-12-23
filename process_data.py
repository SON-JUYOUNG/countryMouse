import pandas as pd
import glob
import os
import json
import random
import requests
import time

# Data Directory
DATA_DIR = "./data"
OUTPUT_FILE = "./lci-backend/src/main/resources/regions_data.json"
KAKAO_API_KEY = "268c7125701f3dd3a73dfd88f9034883"

GU_COORDS = {
    "강남구": (37.4959, 127.0664), "강동구": (37.5301, 127.1238), "강북구": (37.6396, 127.0255),
    "강서구": (37.5509, 126.8495), "관악구": (37.4784, 126.9513), "광진구": (37.5385, 127.0824),
    "구로구": (37.4954, 126.8875), "금천구": (37.4565, 126.8954), "노원구": (37.6542, 127.0568),
    "도봉구": (37.6688, 127.0471), "동대문구": (37.5744, 127.0400), "동작구": (37.5029, 126.9392),
    "마포구": (37.5622, 126.9083), "서대문구": (37.5791, 126.9368), "서초구": (37.4837, 127.0324),
    "성동구": (37.5633, 127.0371), "성북구": (37.5891, 127.0182), "송파구": (37.5145, 127.1063),
    "양천구": (37.5169, 126.8665), "영등포구": (37.5263, 126.8962), "용산구": (37.5323, 126.9906),
    "은평구": (37.6027, 126.9291), "종로구": (37.5730, 126.9794), "중구": (37.5637, 126.9975),
    "중랑구": (37.6065, 127.0927)
}

def get_coords(address, gu):
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    try:
        r = requests.get(url, headers=headers, params={"query": address}, timeout=3).json()
        if r.get('documents'):
            return float(r['documents'][0]['y']), float(r['documents'][0]['x'])
    except: pass
    if gu in GU_COORDS:
        base_lat, base_lng = GU_COORDS[gu]
        return base_lat + random.uniform(-0.01, 0.01), base_lng + random.uniform(-0.01, 0.01)
    return 37.5665, 126.9780

def process_excel_files():
    all_files = glob.glob(os.path.join(DATA_DIR, "*.xlsx"))
    # Map key: (gu, dong, type) -> {deposits: [], rents: [], count: 0}
    # type: "전세" or "월세"
    region_stats = {}

    for file in all_files:
        print(f"Reading file: {os.path.basename(file)}...")
        try:
            df_full = pd.read_excel(file, header=None)
            header_row = -1
            addr_idx, dep_idx, rent_idx, type_idx = -1, -1, -1, -1
            
            # Smart Header Detection
            for i, row in df_full.head(50).iterrows():
                row_list = [str(x).replace(" ", "").replace("\n", "") for x in row.values]
                if "시군구" in row_list:
                    header_row = i
                    addr_idx = row_list.index("시군구")
                    for j, s in enumerate(row_list):
                        if "보증금" in s: dep_idx = j
                        if "월세" in s: rent_idx = j
                        if "전월세구분" in s: type_idx = j
                    break
            
            if header_row == -1 or addr_idx == -1 or dep_idx == -1:
                print(f"Skipping {file}: Header not found.")
                continue

            data_df = df_full.iloc[header_row+1:]
            print(f"Rows to process: {len(data_df)}")
            
            for _, row in data_df.iterrows():
                try:
                    full_addr = str(row.iloc[addr_idx])
                    if "서울특별시" not in full_addr: continue
                    tokens = full_addr.strip().split(" ")
                    if len(tokens) < 3: continue
                    gu, dong = tokens[1], tokens[2]
                    
                    dep_val = str(row.iloc[dep_idx]).replace(",", "")
                    if dep_val == "nan" or not dep_val: continue
                    deposit = int(float(dep_val))
                    
                    rent = 0
                    if rent_idx != -1:
                        rv = str(row.iloc[rent_idx]).replace(",", "")
                        if rv != "nan" and rv: rent = int(float(rv))

                    # Determine type: Force "전세" if rent is 0, else "월세"
                    # However, if explicitly marked as Jeonse but has rent, it's Ban-jeonse (categorize as Monthly)
                    # For simplicity: rent == 0 -> Jeonse, rent > 0 -> Monthly (includes Ban-jeonse)
                    deal_type = "전세" if rent == 0 else "월세"
                    
                    key = (gu, dong, deal_type)
                    if key not in region_stats:
                        region_stats[key] = {"deposits": [], "rents": [], "count": 0}
                    
                    region_stats[key]["deposits"].append(deposit)
                    region_stats[key]["rents"].append(rent)
                    region_stats[key]["count"] += 1
                except: continue
        except Exception as e: print(f"Error {file}: {e}")

    final_results = []
    geo_cache = {}
    if os.path.exists("geo_cache.json"):
        with open("geo_cache.json", "r", encoding="utf-8") as f:
            try: geo_cache = json.load(f)
            except: pass

    print(f"Processing {len(region_stats)} unique Dong/Type pairs...")
    
    for (gu, dong, deal_type), data in region_stats.items():
        if data["count"] < 1: continue
        
        avg_dep = int(sum(data["deposits"])/len(data["deposits"]))
        avg_rent = int(sum(data["rents"])/len(data["rents"]))
        
        # Geocoding once per Dong
        full_addr = f"서울특별시 {gu} {dong}"
        if full_addr in geo_cache:
            lat, lng = geo_cache[full_addr]
        else:
            lat, lng = get_coords(full_addr, gu)
            geo_cache[full_addr] = [lat, lng]
            time.sleep(0.01)

        # Logic for Ban-jeonse (Semi-jeonse) recognition in description
        # If deal_type is monthly but deposit is very high (e.g., > 10,000 * 10,000 for Seoul), 
        # it's practically Ban-jeonse.
        type_str = deal_type
        if deal_type == "월세" and avg_dep > 30000: # Over 300 million dep + some rent
            type_str = "반전세"

        final_results.append({
            "name": f"{gu} {dong} ({type_str})",
            "avgJeonse": int(avg_dep * 10000) if deal_type == "전세" else int((avg_dep + (avg_rent * 12 / 0.05)) * 10000),
            "avgDeposit": int(avg_dep * 10000),
            "avgRent": int(avg_rent * 10000),
            "avgLivingCost": int(650000 + (avg_rent * 4000) if deal_type == "월세" else 600000),
            "timeToWork": 45, "transitCost": 60000,
            "lat": lat, "lng": lng,
            "infraScore": random.randint(80, 98),
            "description": f"{gu} {dong} {deal_type} 거래기반 추천 (평균 {avg_dep}만/월 {avg_rent}만)"
        })

    with open("geo_cache.json", "w", encoding="utf-8") as f: json.dump(geo_cache, f, ensure_ascii=False, indent=2)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f: json.dump(final_results, f, ensure_ascii=False, indent=2)
    print(f"Done! Created {len(final_results)} logic-separated records.")

if __name__ == "__main__":
    process_excel_files()
