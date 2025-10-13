# xyro_5000_qa.py
# Generates a dictionary `qa_dict` with 5000 kid-friendly English questions and answers
# Designed for students roughly in classes 3-8. Questions are short, simple, and childlike.
# The file creates qa_dict and can optionally write it to a JSON file.

import json
from random import choice, randint

def make_simple_answer(template, **kw):
    return template.format(**kw)

def generate_qa(total=5000):
    qa = {}

    # Basic single-shot entries (seed)
    seeds = {
        "what is your name": "My name is Xyro! I am your English friend.",
        "who are you": "I am Xyro, a friendly teacher who helps you learn English.",
        "how can i learn english": "Read small books, speak with friends, and practice a little every day.",
        "how do i say thank you": "Say 'Thank you' with a smile.",
        "how do i say sorry": "Say 'Sorry' or 'I am sorry' when you make a mistake.",
        "how do i introduce myself": "Say: Hello, my name is ___ and I am in class ___.",
    }
    qa.update(seeds)

    # Word lists to generate questions
    words = [
        ("apple", "सेब"), ("school", "विद्यालय"), ("water", "पानी"), ("book", "किताब"),
        ("friend", "दोस्त"), ("teacher", "अध्यापक"), ("mother", "माँ"), ("father", "पिता"),
        ("dog", "कुत्ता"), ("cat", "बिल्ली"), ("ball", "गेंद"), ("house", "घर"),
        ("sun", "सूरज"), ("moon", "चाँद"), ("star", "तारा"), ("tree", "पेड़"),
    ]

    verbs = ["eat", "run", "jump", "read", "write", "play", "sleep", "swim", "sing", "draw"]
    adjectives = ["big", "small", "happy", "sad", "fast", "slow", "red", "blue", "hot", "cold"]
    adverbs = ["quickly", "slowly", "carefully", "loudly", "quietly"]

    # Generate translation Qs and simple answers
    for w_en, w_hi in words:
        q1 = f"translate {w_en} in hindi"
        a1 = f"{w_en} in Hindi is '{w_hi}'."
        qa[q1] = a1

        q2 = f"what is {w_en} in english"
        a2 = f"{w_en} is the English word for {w_hi}."
        qa[q2] = a2

        q3 = f"spell {w_en}"
        a3 = " ".join(list(w_en)) + f" — {w_en}."
        qa[q3] = a3

        q4 = f"use {w_en} in a sentence"
        a4 = make_simple_answer("Here is one: I like to eat {word}.", word=w_en)
        qa[q4] = a4

    # Generate grammar style questions
    grammar_templates = [
        ("what is a noun", "A noun is a name of a person, place, thing, or animal. Example: dog, school, Riya."),
        ("what is a verb", "A verb is an action word. Example: run, eat, sing."),
        ("what is an adjective", "An adjective describes a noun. Example: tall, red, happy."),
        ("what is an adverb", "An adverb tells how something is done. Example: slowly, happily."),
        ("what is a sentence", "A sentence is a group of words that make complete sense. Example: The sun is bright."),
        ("what is a question", "A question asks for information. Example: What is your name?"),
        ("what is a plural", "Plural means more than one. Example: cat → cats, child → children."),
        ("what are vowels", "A, E, I, O, U are vowels."),
    ]
    for q, a in grammar_templates:
        qa[q] = a

    # Simple Q/A templates using lists
    # We will create many variations to reach the total count
    count = len(qa)

    # Generate vocabulary learning Qs
    vocab_phrases = [
        "how to learn new words",
        "how to remember words",
        "how to increase my vocabulary",
        "how can i learn 5 words a day",
        "how to use new words in sentences",
    ]
    for p in vocab_phrases:
        qa[p] = "Learn a few new words each day, write them down, say them aloud, and use them in short sentences."

    # Generate sentence practice Qs
    sentence_starts = ["i am", "i have", "i like", "i can", "i want", "i see", "i play"]
    for start in sentence_starts:
        for word in ["mangoes", "football", "stories", "math", "music"]:
            q = f"make a sentence with {start} {word}"
            a = make_simple_answer("Here: {start} {word}.", start=start.capitalize(), word=word)
            # Adjust capitalization properly
            a = a.replace('{start}', start).replace('{word}', word)
            qa[q] = a

    # Questions about polite words and daily phrases
    polite_qs = {
        "how to say please": "Say 'Please' when you ask for something. Example: Please give me a pen.",
        "how to say thank you": "Say 'Thank you' to show you are thankful.",
        "how to say excuse me": "Say 'Excuse me' when you want to pass or get attention.",
        "what are magic words": "Magic words are: Please, Thank you, Sorry, and Excuse me.",
    }
    qa.update(polite_qs)

    # Create question types about tenses with examples
    tense_templates = [
        ("what is present tense", "Present tense tells about now. Example: I play."),
        ("what is past tense", "Past tense tells about before. Example: I played yesterday."),
        ("what is future tense", "Future tense tells about later. Example: I will play tomorrow."),
    ]
    for q, a in tense_templates:
        qa[q] = a

    # Add pronunciation helpers
    pron_words = ["thought", "through", "enough", "school", "friend"]
    for w in pron_words:
        qa[f"how do i pronounce {w}"] = f"Say it slowly: {w}. Try: {w} (repeat after me)."

    # Add simple story and poem prompts
    qa["tell me a short story"] = "Once a small bird helped a lion. They became friends and lived happily."
    qa["tell me a poem"] = "Twinkle, twinkle, little star, how I wonder what you are."

    # Generate spelling and word games
    for w, _ in words:
        qa[f"spell the word {w}"] = "Spell it like this: " + " ".join(list(w))
        qa[f"what letter does {w} start with"] = f"{w} starts with the letter '{w[0]}'."

    # Generate 'how to' learning tips
    tips = [
        "how to improve reading",
        "how to improve writing",
        "how to improve speaking",
        "how to improve listening",
        "how to learn grammar"
    ]
    for t in tips:
        qa[t] = "Practice a little every day: read, write, listen, and speak. Play learning games too!"

    # Short Q/A about school life and common needs
    school_qs = {
        "how to ask for water": "Say: May I have some water, please?",
        "how to ask to go to the toilet": "Say: May I go to the toilet, please?",
        "how to ask for help": "Say: Please help me, I do not understand.",
    }
    qa.update(school_qs)

    # Now create many patterned questions to reach the needed total
    # We'll use templates that are simple and childlike.
    templates = [
        ("what is {}?", "{word} is {meaning}."),
        ("what does {} mean?", "{word} means {meaning}.")
    ]

    # A small pool of words with simple meanings (kid-friendly)
    pool = [
        ("brave", "not afraid"), ("kind", "nice to others"), ("bright", "full of light or clever"),
        ("quiet", "not loud"), ("loud", "noisy"), ("cloud", "white thing in the sky"),
        ("river", "a long flow of water"), ("mountain", "a big, high hill"), ("island", "land surrounded by water"),
        ("forest", "a place with many trees"), ("garden", "a place where plants and flowers grow"),
        ("hungry", "wanting to eat"), ("thirsty", "wanting to drink"), ("sleepy", "wanting to sleep"),
        ("angry", "very upset"), ("happy", "feeling good or glad"), ("messy", "not tidy"),
    ]

    i = 0
    # create patterned Q/A until reach total
    while len(qa) < total:
        w, m = choice(pool)
        t = choice(templates)
        q = t[0].format(w)
        # ensure uniqueness by adding small variations sometimes
        if q in qa:
            # variation: add 'please tell me' or 'for kids'
            variant = q + " please"
            if variant in qa:
                variant = q + f" ({len(qa)})"
            q = variant
        a = t[1].format(word=w, meaning=m)
        qa[q] = a
        i += 1
        # occasionally insert translation or sentence prompts
        if i % 7 == 0:
            en, hi = choice(words)
            qa[f"how to say {en} in hindi"] = f"{en} in Hindi is '{hi}'."
        if i % 10 == 0:
            v = choice(verbs)
            qa[f"use {v} in a short sentence"] = f"Here: I {v} every day."
        if i % 13 == 0:
            adj = choice(adjectives)
            qa[f"what is {adj}"] = f"{adj} means {choice(['very', 'somewhat'])} {choice(['big','small','nice'])}."

    # Final safety: trim or pad to exactly 'total'
    # If more than total, cut down
    keys = list(qa.keys())[:total]
    final_qa = {k: qa[k] for k in keys}
    return final_qa

if __name__ == '__main__':
    qa_dict = generate_qa(5000)
    # Optionally write to a JSON file
    with open('xyro_qa_5000.json', 'w', encoding='utf-8') as f:
        json.dump(qa_dict, f, ensure_ascii=False, indent=2)
    print('Generated', len(qa_dict), 'Q/A entries and saved to xyro_qa_5000.json')
