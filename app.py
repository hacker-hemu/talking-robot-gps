# ======================================
# 🧠 Simple Chatbot using Flask (Class 8 Level)
# ======================================
# Author: I-KIT LAB
# Description:
#   This Flask app is a basic chatbot project for students.
#   It can answer predefined questions using fuzzy text matching.
#   It also supports showing and loading known images from a folder.
# ======================================

from flask import Flask, jsonify, request, send_from_directory
import os
from rapidfuzz import fuzz, process  # For smart question matching
import json


# Create Flask web application
app = Flask(__name__, static_folder="static", static_url_path="/static")

# === Step 1: Predefined Question & Answer Dictionary ===
# This is the chatbot’s memory — it knows answers to these questions.
qa_file = "qa.json"
if os.path.exists(qa_file):
    with open(qa_file, "r", encoding="utf-8") as f:
        qa_dict = json.load(f)
else:
    print("⚠️ qa.json not found — using default dictionary")
    qa_dict = {
        "who is your father": "Hemant",
        "what is your name": "I am Xyro, your language-learning assistant!",
        "who are you": "I am a virtual language teacher here to help you improve your language skills.",
        "what languages can you teach": "I can teach English, Spanish, French, German, Hindi, and more!"
    }


# === Step 2: Homepage Route ===
# Opens the main webpage (index.html) when we visit http://localhost:5000
@app.route('/')
def index():
    return send_from_directory("static", "index.html")


# === Step 3: Known Images Route ===
# This route sends an image file from the 'known' folder when requested.
@app.route('/known/<path:filename>')
def known(filename):
    return send_from_directory("known", filename)


# === Step 4: Known Image List Route ===
# Returns a list of all image filenames available in the 'known' folder.
@app.route('/known-list', methods=["GET"])
def known_list():
    base = os.path.join(os.getcwd(), "known")
    files = []
    
    # Check if 'known' folder exists, then list only image files
    if os.path.isdir(base):
        for f in os.listdir(base):
            if f.lower().endswith((".jpg", ".png", ".jpeg")):
                files.append(f)

    return jsonify({"images": files})


# === Step 5: Chatbot Question Route ===
# This route handles questions asked by the user and finds best answer.
@app.route('/ask', methods=['POST'])
def ask():
    """
    This route receives a question (in JSON format),
    compares it with known questions using fuzzy logic,
    and returns the best-matching answer.
    """
    data = request.get_json(silent=True)
    question = (data.get('question') or '').strip().lower()

    # If the user didn’t type a question
    if not question:
        return jsonify({"answer": "Please ask a valid question."})

    print(f"🧠 User asked: {question}")

    # Step 6: Find best match using fuzzy matching
    best_match, score = None, 0
    result = process.extractOne(question, qa_dict.keys(), scorer=fuzz.token_sort_ratio)

    if result:
        best_match, score = result[0], result[1]

    # Step 7: Respond based on match score
    if score >= 60:
        print(f"✅ Matched question: '{best_match}' ({score}%)")
        return jsonify({
            "answer": qa_dict[best_match],
            "match": best_match,
            "score": score
        })
    # else:
    #     # If no good match found
    #     print("❌ No suitable match found.")
    #     return jsonify({
    #         "answer": "Sorry, I didn’t understand that. Can you rephrase?",
    #         "match": None,
    #         "score": score
    #     })


# === Step 8: Run Flask App ===
if __name__ == "__main__":
    # debug=True helps students see error messages while learning
    app.run(host='0.0.0.0', port=5000, debug=True)
