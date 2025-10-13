# train.py (with debugging)
import os
import csv
import pickle
import face_recognition
from PIL import Image
import numpy as np

CSV_PATH = "dataset.csv"
OUT_PATH = "encodings.pkl"
TOLERANCE = 0.6

encodings = []
names = []
descriptions_map = {}

count = 0
with open(CSV_PATH, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        name = row['name'].strip()
        path = row['image_path'].strip()
        desc = row.get('description', '').strip()
        
        # DEBUG: Print what we're reading
        print(f"CSV Name: '{name}', Image Path: '{path}'")
        
        if not os.path.exists(path):
            print(f"[WARN] missing file: {path}")
            continue
            
        # Extract filename from path for comparison
        filename = os.path.splitext(os.path.basename(path))[0]
        print(f"Filename (without extension): '{filename}'")
        
        img = face_recognition.load_image_file(path)
        face_locations = face_recognition.face_locations(img, model='hog')
        
        if len(face_locations) == 0:
            print(f"  no face found in {path}, skipping")
            continue
            
        face_encs = face_recognition.face_encodings(img, face_locations)
        if len(face_encs) == 0:
            print(f"  could not compute encoding for {path}")
            continue
            
        encodings.append(face_encs[0])
        names.append(name)  # This uses CSV name
        if desc:
            descriptions_map[name] = desc
        count += 1

print(f"Finished. Saved {count} encodings.")
data = {"encodings": encodings, "names": names, "descriptions": descriptions_map}
with open(OUT_PATH, "wb") as f:
    pickle.dump(data, f)
print("Saved to", OUT_PATH)