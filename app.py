from flask import Flask, jsonify, request, send_from_directory
import os
import json
from rapidfuzz import fuzz, process
import google.generativeai as genai
import re


genai.configure(api_key="AIzaSyB_56-KjiwDaO-cwIo5j3BbkcM8_a-pXk0")


app = Flask(__name__, static_folder="static", static_url_path="/static")

# === Load Q&A Dictionary ===
def load_qa_data():
    qa_file = "qa.json"
    default_qa = {
        "hi": "Hello! I'm Xyro, the AI bot created by 8th grade students at GPS. How can I help you today?",
        "hello": "Namaste! I'm Xyro from GPS AI Lab. Welcome to our event!",
        "hey": "Hey there! I'm Xyro. Great to see you!",
        "what is your name": "I am Xyro, your language-learning assistant!",
        "who are you": "I am a virtual language teacher here to help you improve your language skills.",
        "welcome back": "Thank you! It's good to see you again!",
        "good morning": "Good morning! A wonderful day to visit our GPS AI Lab!",
        "good afternoon": "Good afternoon! I hope you're having a great day!",
        "good evening": "Good evening! Welcome to our exhibition.",
        "how are you": "I'm doing great! Thanks for asking. How can I help you today?",
        "what can you do": "I can answer your questions, help with language learning, and tell you about our GPS AI Lab!",
        "tell me about yourself": "I'm Xyro, an AI assistant created by 8th grade students at GPS. I'm here to help you learn and explore!",
        "who created you": "I was created by the brilliant 8th grade students at GPS school!",
        "what is gps": "GPS is our school where students learn and create amazing projects like me!",
        "thank you": "You're welcome! Happy to help!",
        "thanks": "You're welcome! Is there anything else I can help with?",
        "bye": "Goodbye! Have a great day!",
        "goodbye": "See you later! Come back soon!"
    }
    
    if os.path.exists(qa_file):
        try:
            with open(qa_file, "r", encoding="utf-8") as f:
                loaded_data = json.load(f)
                print(f"✅ Loaded {len(loaded_data)} questions from qa.json")
                return loaded_data
        except Exception as e:
            print(f"❌ Error loading qa.json: {e}. Using default Q&A.")
            return default_qa
    else:
        print("⚠️ qa.json not found — using default dictionary")
        return default_qa


# Load Q&A data
qa_dict = load_qa_data()

# def get_gemini_answer(question):
#     try:
#         # Use a valid model name
#         model = genai.GenerativeModel("gemini-2.5-flash")
#         response = model.generate_content(question)
#         return response.text.strip() if response.text else "No answer from Gemini."
#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return f"Sorry, Gemini is not responding right now ({e})"

def clean_gemini_text(text: str) -> str:
    """Remove markdown, bullets, numbering, and shrink long text."""
    if not text:
        return ""

    # Remove markdown/special characters and bullets
    cleaned = re.sub(r'[*_`>#=\[\]{}|\\~^]', '', text)
    cleaned = re.sub(r'^\s*\d+[\.\)]\s*', '', cleaned, flags=re.MULTILINE)  # remove numbered lists
    cleaned = re.sub(r'[-•]\s*', '', cleaned)                               # remove bullet marks
    cleaned = re.sub(r'\s{2,}', ' ', cleaned).strip()

    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', cleaned)

    # Keep only the first few sentences (approx. 50 words total)
    short_text = []
    total_words = 0
    for s in sentences:
        words = len(s.split())
        if total_words + words > 50:
            break
        short_text.append(s)
        total_words += words

    return ' '.join(short_text)

def get_gemini_answer(question):
    """Ask Gemini and return a short, clean reply."""
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(question)
        raw_text = response.text.strip() if response.text else "No answer from Gemini."

        cleaned_text = clean_gemini_text(raw_text)
        return cleaned_text if cleaned_text else raw_text[:200]

    except Exception as e:
        import traceback
        traceback.print_exc()
        return f"Sorry, Gemini is not responding right now ({e})"
    

@app.route('/')
def index():
    return send_from_directory("static", "index.html")

@app.route('/known/<path:filename>')
def known(filename):
    return send_from_directory("known", filename)

@app.route('/known-list', methods=["GET"])
def known_list():
    try:
        base = os.path.join(os.getcwd(), "known")
        files = []
        
        if os.path.isdir(base):
            for f in os.listdir(base):
                if f.lower().endswith((".jpg", ".png", ".jpeg")):
                    files.append(f)
        
        print(f"📁 Found {len(files)} known face images")
        return jsonify({"images": files})
    
    except Exception as e:
        print(f"❌ Error in known-list: {e}")
        return jsonify({"images": []})


@app.route('/ask', methods=['POST'])
def ask():
    try:
        print("📥 Received request to /ask")

        # Validate JSON
        if not request.is_json:
            return jsonify({"answer": "Please provide a valid JSON request.", "match": None, "score": 0}), 400

        data = request.get_json()
        question = (data.get('question') or '').strip().lower()

        if not question:
            return jsonify({"answer": "Please ask a valid question.", "match": None, "score": 0}), 400

        print(f"🧠 User asked: '{question}'")

        # Normalize question (remove punctuation)
        import re
        question_clean = re.sub(r'[^\w\s]', '', question)

        best_match = None
        best_score = 0

        # === Improved Matching Logic ===
        for key in qa_dict.keys():
            key_clean = re.sub(r'[^\w\s]', '', key.lower())
            score = fuzz.ratio(question_clean, key_clean)

            # Bonus points for substring match (direct inclusion)
            if key_clean in question_clean or question_clean in key_clean:
                score += 15

            if score > best_score:
                best_score = score
                best_match = key

        print(f"🔍 Best match: '{best_match}' ({best_score}%)")

        # === Confidence check ===
        if best_score >= 90:
            print(f"✅ Answering for: '{best_match}'")
            return jsonify({
                "answer": qa_dict[best_match],
                "match": best_match,
                "score": best_score
            })
        else:
            print(f"⚠️ Low confidence ({best_score}%) — asking Gemini...")
            gemini_answer = get_gemini_answer(question)

            return jsonify({
                "answer": gemini_answer,
                "match": None,
                "score": best_score,
                "source": "gemini"
            })
        # else:
        #     print(f"❌ Low confidence ({best_score}%)")
        #     return jsonify({
        #         "answer": "Sorry, I didn't understand that clearly. Can you rephrase?",
        #         "match": best_match,
        #         "score": best_score
        #     })

    except Exception as e:
        print(f"❌ Error in /ask: {str(e)}")
        # return jsonify({
        #     "answer": "Sorry, an error occurred. Please try again.",
        #     "match": None,
        #     "score": 0,
        #     "error": str(e)
        # }), 500


@app.route("/encodings")
def get_encodings():
    import pickle
    with open("encodings.pkl", "rb") as f:
        data = pickle.load(f)
    # Convert numpy arrays to lists for JSON
    data["encodings"] = [enc.tolist() for enc in data["encodings"]]
    return jsonify(data)

@app.route('/test')
def test():
    """Test route to check if server is working"""
    return jsonify({
        "status": "Server is running!",
        "qa_count": len(qa_dict),
        "endpoints": ["/", "/ask", "/known-list", "/test"]
    })

if __name__ == "__main__":
    print("🚀 Starting Flask server...")
    print(f"📚 Loaded {len(qa_dict)} Q&A pairs")
    print("🌐 Server will be available at: http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)