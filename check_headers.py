import pandas as pd
import glob
import os

all_files = glob.glob("./data/*.xlsx")
for f in all_files:
    print(f"\n--- {f} ---")
    try:
        df = pd.read_excel(f, header=None, nrows=30)
        for i, row in df.iterrows():
            if "시군구" in [str(x) for x in row.values]:
                print(f"Header at row {i}")
                print(row.values)
                break
    except Exception as e:
        print(e)
