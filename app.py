# # ======================================
# # 🧠 Simple Chatbot using Flask
# # ======================================

# from flask import Flask, jsonify, request, send_from_directory
# import os
# import json
# from rapidfuzz import fuzz, process

# app = Flask(__name__, static_folder="static", static_url_path="/static")

# # === Load Q&A Dictionary ===
# qa_file = "qa.json"
# if os.path.exists(qa_file):
#     with open(qa_file, "r", encoding="utf-8") as f:
#         qa_dict = json.load(f)
# else:
#     print("⚠️ qa.json not found — using default dictionary")
#     qa_dict = {
#         "hi": "Hello! I'm Xyro, the AI bot created by 8th grade students at GPS. How can I help you today?",
#         "hello": "Namaste! I'm Xyro from GPS AI Lab. Welcome to our event!",
#         "hey": "Hey there! I'm Xyro. Great to see you!",
#         "what is your name": "I am Xyro, your language-learning assistant!",
#         "who are you": "I am a virtual language teacher here to help you improve your language skills.",
#         "welcome back": "Thank you! It's good to see you again!",
#         "good morning": "Good morning! A wonderful day to visit our GPS AI Lab!",
#         "good afternoon": "Good afternoon! I hope you're having a great day!",
#         "good evening": "Good evening! Welcome to our exhibition."
#     }

# @app.route('/')
# def index():
#     return send_from_directory("static", "index.html")

# @app.route('/known/<path:filename>')
# def known(filename):
#     return send_from_directory("known", filename)

# @app.route('/known-list', methods=["GET"])
# def known_list():
#     base = os.path.join(os.getcwd(), "known")
#     files = []
    
#     if os.path.isdir(base):
#         for f in os.listdir(base):
#             if f.lower().endswith((".jpg", ".png", ".jpeg")):
#                 files.append(f)

#     return jsonify({"images": files})

# @app.route('/ask', methods=['POST'])
# def ask():
#     try:
#         # Get JSON data safely
#         if not request.is_json:
#             return jsonify({
#                 "answer": "Please provide a valid JSON request.",
#                 "match": None,
#                 "score": 0
#             }), 400
        
#         data = request.get_json()
#         if not data:
#             return jsonify({
#                 "answer": "Please provide a valid JSON request.",
#                 "match": None,
#                 "score": 0
#             }), 400
        
#         question = (data.get('question') or '').strip().lower()

#         if not question:
#             return jsonify({
#                 "answer": "Please ask a valid question.",
#                 "match": None,
#                 "score": 0
#             }), 400

#         print(f"🧠 User asked: {question}")

#         # Find best match using fuzzy matching
#         best_match, score = None, 0
        
#         if qa_dict and len(qa_dict) > 0:
#             result = process.extractOne(question, qa_dict.keys(), scorer=fuzz.token_sort_ratio)
#             if result:
#                 best_match, score = result[0], result[1]
#         else:
#             return jsonify({
#                 "answer": "I'm still learning. Please try again later.",
#                 "match": None,
#                 "score": 0
#             }), 500

#         # Respond based on match score
#         if score >= 60:
#             print(f"✅ Matched question: '{best_match}' ({score}%)")
#             return jsonify({
#                 "answer": qa_dict[best_match],
#                 "match": best_match,
#                 "score": score
#             })
#         # else:
#         #     # If no good match found
#         #     print(f"❌ No suitable match found. Best match: {best_match} ({score}%)")
#         #     return jsonify({
#         #         "answer": "Sorry, I didn't understand that. Can you rephrase?",
#         #         "match": best_match,
#         #         "score": score
#         #     })
            
#     except Exception as e:
#         print(f"❌ Error in /ask route: {str(e)}")
#         return jsonify({
#             "answer": "Sorry, I encountered an error. Please try again.",
#             "match": None,
#             "score": 0,
#             "error": str(e)
#         }), 500

# if __name__ == "__main__":
#     app.run(host='0.0.0.0', port=5000, debug=True)



from flask import Flask, jsonify, request, send_from_directory
import os
import json
from rapidfuzz import fuzz, process

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
        
        # Get JSON data
        if not request.is_json:
            print("❌ Request is not JSON")
            return jsonify({
                "answer": "Please provide a valid JSON request.",
                "match": None,
                "score": 0
            }), 400
        
        data = request.get_json()
        if not data:
            print("❌ No data in request")
            return jsonify({
                "answer": "Please provide a valid JSON request.",
                "match": None,
                "score": 0
            }), 400
        
        question = (data.get('question') or '').strip().lower()
        print(f"🧠 User asked: '{question}'")

        if not question:
            print("❌ Empty question")
            return jsonify({
                "answer": "Please ask a valid question.",
                "match": None,
                "score": 0
            }), 400

        # Find best match using fuzzy matching
        best_match, score = None, 0
        
        if qa_dict and len(qa_dict) > 0:
            try:
                result = process.extractOne(question, qa_dict.keys(), scorer=fuzz.token_sort_ratio)
                if result:
                    best_match, score = result[0], result[1]
                    print(f"🔍 Best match: '{best_match}' with score: {score}%")
            except Exception as e:
                print(f"❌ Error in fuzzy matching: {e}")
                # Fallback: simple keyword matching
                for key in qa_dict.keys():
                    if key in question:
                        best_match, score = key, 80
                        break
        else:
            print("❌ Q&A dictionary is empty")
            return jsonify({
                "answer": "I'm still learning. Please try again later.",
                "match": None,
                "score": 0
            }), 500

        # Respond based on match score
        if score >= 50:  # Lowered threshold to 50% for better matching
            print(f"✅ Answering: '{best_match}'")
            return jsonify({
                "answer": qa_dict[best_match],
                "match": best_match,
                "score": score
            })
        # else:
        #     # If no good match found
        #     print(f"❌ No good match found. Best was: '{best_match}' ({score}%)")
        #     return jsonify({
        #         "answer": "Sorry, I didn't understand that. Can you rephrase your question?",
        #         "match": best_match,
        #         "score": score
        #     })
            
    except Exception as e:
        print(f"❌ Unexpected error in /ask route: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "answer": "Sorry, I encountered an unexpected error. Please try again.",
            "match": None,
            "score": 0,
            "error": str(e)
        }), 500

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