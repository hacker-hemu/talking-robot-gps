import os
import json
import pickle
import face_recognition
from PIL import Image
import numpy as np

JSON_PATH = "dataset.json"     # your dataset file
OUT_PATH = "encodings.pkl"
TOLERANCE = 0.6

encodings = []
names = []
descriptions_map = {}  # name -> description (last write wins)

def load_image(path):
    try:
        img = face_recognition.load_image_file(path)
        return img
    except Exception as e:
        print(f"[ERROR] Failed to load {path}: {e}")
        return None

count = 0

# Load JSON data
with open(JSON_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

# Process each person
for person in data:
    # ✅ FIX 1: Always take name from JSON (not filename)
    name = person.get("name", "").strip()

    image_paths = person.get("images", [])
    desc = person.get("description", "").strip()

    if not image_paths:
        print(f"[WARN] No images listed for {name}, skipping.")
        continue

    print(f"\n🧠 Training: {name} ({len(image_paths)} images)")
    for path in image_paths:
        if not os.path.exists(path):
            print(f"  [WARN] Missing file: {path}")
            continue

        print(f"  Processing {path} for {name} ...")
        img = load_image(path)
        if img is None:
            continue

        face_locations = face_recognition.face_locations(img, model='hog')
        if len(face_locations) == 0:
            print(f"    No face found in {path}, skipping.")
            continue

        face_encs = face_recognition.face_encodings(img, face_locations)
        if len(face_encs) == 0:
            print(f"    Could not compute encoding for {path}")
            continue

        # ✅ FIX 2: Explicitly ensure label always equals the JSON name
        encodings.append(face_encs[0])
        names.append(name)  # Do not derive from path
        count += 1
        print(f"    ✅ Saved encoding for: {name}")

    if desc:
        descriptions_map[name] = desc

print(f"\n✅ Finished training. Total encodings saved: {count}")
data_out = {"encodings": encodings, "names": names, "descriptions": descriptions_map}

# Save encodings to pickle
with open(OUT_PATH, "wb") as f:
    pickle.dump(data_out, f)

print("💾 Saved to", OUT_PATH)
