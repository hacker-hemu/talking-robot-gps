# from flask import Flask, jsonify, request, send_from_directory
# import os

# app = Flask(__name__, static_folder="static", static_url_path="/static")

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

# if __name__ == "__main__":
#     app.run(debug=True)






from flask import Flask, jsonify, request, send_from_directory
import os
from rapidfuzz import fuzz, process
import requests
import re

import requests
import re
from flask import Flask, request, jsonify
from fuzzywuzzy import fuzz


app = Flask(__name__, static_folder="static", static_url_path="/static")

# === Predefined Q&A dictionary ===
qa_dict = {
    "what is your name": "I am Xyro, your language-learning assistant!",
    "who are you": "I am a virtual language teacher here to help you improve your language skills.",
    "what languages can you teach": "I can teach English, Spanish, French, German, Hindi, and more!",
    "what is a noun": "A noun is a word that represents a person, place, thing, or idea.",
    "what is a verb": "A verb is a word that expresses an action or state of being.",
    "what is an adjective": "An adjective is a word that describes a noun or pronoun.",
    "what is a preposition": "A preposition shows the relationship between a noun or pronoun and another word.",
    "what is a conjunction": "A conjunction connects words, phrases, or clauses.",
    "what is an adverb": "An adverb describes a verb, adjective, or another adverb.",
    "what is a pronoun": "A pronoun replaces a noun to avoid repetition, like he, she, or it.",
    "how can i improve my vocabulary": "You can improve your vocabulary by reading, practicing flashcards, and using new words in sentences.",
    # ... you can paste your full qaDict here ...
}


@app.route('/')
def index():
    return send_from_directory("static", "index.html")


@app.route('/known/<path:filename>')
def known(filename):
    return send_from_directory("known", filename)


@app.route('/known-list', methods=["GET"])
def known_list():
    base = os.path.join(os.getcwd(), "known")
    files = []
    if os.path.isdir(base):
        for f in os.listdir(base):
            if f.lower().endswith((".jpg", ".png", ".jpeg")):
                files.append(f)
    return jsonify({"images": files})


# === New route: Ask a question (fuzzy matching) ===
@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    question = data.get('question', '').strip().lower()

    if not question:
        return jsonify({"answer": "Please ask a valid question."})

    # Find best fuzzy match (using ratio)
    best_match, score, _ = process.extractOne(
        question, qa_dict.keys(), scorer=fuzz.token_sort_ratio
    )

    if score >= 60:  # 60% threshold
        return jsonify({"answer": qa_dict[best_match], "match": best_match, "score": score})
    # else:
    #     return jsonify({"answer": "Sorry, I didn’t understand that.", "score": score})



# @app.route("/ask", methods=["POST"])
# def ask():
#     data = request.get_json()
#     user_query = data.get("query", "").strip()
#     print(f"🔍 Searching DuckDuckGo for: {user_query}")

#     try:
#         # ✅ Use DuckDuckGo Instant Answer API
#         url = f"https://api.duckduckgo.com/?q={user_query}&format=json&no_html=1"
#         response = requests.get(url)
#         result = response.json()

#         answer = (
#             result.get("AbstractText") or
#             result.get("Heading") or
#             result.get("RelatedTopics", [{}])[0].get("Text") or
#             None
#         )

#         if not answer:
#             print("❌ No summary found.")
#             answer = "Sorry, I couldn't find any information on that."

#         print("✅ Answer:", answer)
#         return jsonify({"answer": answer})

#     except Exception as e:
#         print(f"❌ Search failed: {type(e).__name__} - {e}")
#         return jsonify({"answer": "Sorry, something went wrong."})



# @app.route("/ask", methods=["POST"])
# def ask():
    data = request.get_json()
    question = data.get("question", "").strip().lower()

    if not question:
        return jsonify({"answer": "Please ask a valid question."})

    print(f"🧠 User asked: {question}")

    # ✅ Step 1: Try to match predefined Q&A
    # Step 1: Try to match predefined Q&A
    best_match, score = None, 0
    if qa_dict:
        result = process.extractOne(question, qa_dict.keys(), scorer=fuzz.token_sort_ratio)
        if result:
            best_match, score = result[0], result[1]

    if score >= 60:
        print(f"✅ Matched predefined Q: '{best_match}' ({score}%)")
        return jsonify({"answer": qa_dict[best_match], "match": best_match, "score": score})


    # ✅ Step 2: If not matched, fallback to Google search
    print("🌐 No good predefined match. Searching Google...")

    try:
        clean_query = re.sub(r'[^a-zA-Z0-9\s?]', '', question)
        results = list(search(clean_query, tld="co.in", num=3, stop=3, pause=2))

        if not results:
            return jsonify({"answer": "Sorry, I couldn't find anything on Google."})

        print("✅ Top Results:")
        for r in results:
            print(" -", r)

        # Optional: fetch short preview from first result
        try:
            page = requests.get(results[0], timeout=5)
            snippet = page.text[:300]
        except Exception:
            snippet = ""

        answer = f"Here are some results I found about {question}: {results[0]}"
        return jsonify({"answer": answer, "match": "google", "score": score})

    except Exception as e:
        print(f"❌ Google search failed: {type(e).__name__} - {e}")
        return jsonify({"answer": "Sorry, something went wrong while searching Google."})





if __name__ == "__main__":
    app.run(debug=True)
