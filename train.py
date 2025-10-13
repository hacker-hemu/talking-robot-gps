# train.py
import os
import csv
import pickle
import face_recognition
from PIL import Image
import numpy as np

CSV_PATH = "dataset.csv"       # your CSV
OUT_PATH = "encodings.pkl"
TOLERANCE = 0.6

encodings = []
names = []
descriptions_map = {}  # name -> description (last write wins)

def load_image(path):
    # face_recognition works with numpy arrays in RGB
    img = face_recognition.load_image_file(path)
    return img

count = 0
with open(CSV_PATH, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        name = row['name'].strip()
        path = row['image_path'].strip()
        desc = row.get('description', '').strip()
        if not os.path.exists(path):
            print(f"[WARN] missing file: {path}")
            continue
        print(f"Processing {path} for {name} ...")
        img = load_image(path)
        # detect faces and encodings (may return multiple, take the first face)
        face_locations = face_recognition.face_locations(img, model='hog')
        if len(face_locations) == 0:
            print(f"  no face found in {path}, skipping")
            continue
        face_encs = face_recognition.face_encodings(img, face_locations)
        if len(face_encs) == 0:
            print(f"  could not compute encoding for {path}")
            continue
        # store first encoding (or all; using first for simplicity)
        encodings.append(face_encs[0])
        names.append(name)
        if desc:
            descriptions_map[name] = desc
        count += 1

print(f"Finished. Saved {count} encodings.")
data = {"encodings": encodings, "names": names, "descriptions": descriptions_map}
with open(OUT_PATH, "wb") as f:
    pickle.dump(data, f)
print("Saved to", OUT_PATH)
