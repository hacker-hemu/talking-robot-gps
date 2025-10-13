

// 🎤 Global speech recognizer
let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = false;
recognition.lang = "en-US";


const VIDEO_WIDTH = 480;
const VIDEO_HEIGHT = 360;
const DETECT_INTERVAL = 400;
const TINY_INPUT_SIZE = 160;
const SCORE_THRESHOLD = 0.5;

// Store last greeted times
const GREET_DELAY = 30000; // 15 seconds

const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const robotMouth = document.querySelector('.mouth');

let faceMatcher = null;
let labeledDescriptors = [];
// let greeted = new Set();

const greeted = new Map();

// === Predefined Q&A dictionary ===
// const qaDict = {
//   "who is your father": "Hemant",
//   "what is your name": "I am Xyro, your language-learning assistant!",
//   "who are you": "I am a virtual language teacher here to help you improve your language skills.",
//   "what languages can you teach": "I can teach English, Spanish, French, German, Hindi, and more!",
//   "how can i improve my vocabulary": "You can improve your vocabulary by reading, practicing flashcards, and using new words in sentences.",
//   "what is a noun": "A noun is a word that represents a person, place, thing, or idea.",
//   "what is a verb?": "A verb is a word that expresses an action or state of being.",
//   "what is an adjective": "An adjective is a word that describes a noun or pronoun.",
//   "how do i form a sentence": "A basic sentence has a subject, a verb, and sometimes an object.",
//   "can you teach me grammar": "Yes! I can explain grammar rules and give examples for practice.",
//   "what is the past tense of 'go'": "The past tense of 'go' is 'went'.",
//   "what is the plural of 'child'": "The plural of 'child' is 'children'.",
//   "how do i pronounce 'thought'": "It is pronounced as /θɔːt/.",
//   "can you correct my sentences": "Absolutely! Share your sentences, and I will help you correct them.",
//   "what are synonyms": "Synonyms are words that have the same or similar meanings.",
//   "what are antonyms": "Antonyms are words that have opposite meanings.",
//   "how do i improve my speaking skills": "Practice speaking daily, record yourself, and engage in conversations.",
//   "how do i improve my writing skills": "Write regularly, read good texts, and revise your work.",
//   "can you teach me pronunciation": "Yes! I can guide you on phonetics, stress, and intonation.",
//   "what is the difference between 'their' and 'there'": "'Their' shows possession, 'there' indicates a place.",
//   "what is the difference between 'your' and 'you're'": "'Your' is possessive, 'you're' is a contraction of 'you are'.",
//   "how can i learn new words fast": "Use flashcards, read daily, and try to use words in sentences.",
//   "can you make a quiz for me": "Sure! I can create vocabulary, grammar, or comprehension quizzes.",
//   "what is a preposition": "A preposition shows the relationship between a noun or pronoun and another word.",
//   "can you teach me tenses": "Yes! I can explain past, present, and future tenses with examples.",
//   "what is a sentence fragment": "A sentence fragment is an incomplete sentence that lacks a subject or verb.",
//   "what is a compound sentence": "A compound sentence has two or more independent clauses joined by a conjunction.",
//   "how do i use articles": "Use 'a' or 'an' for non-specific nouns, and 'the' for specific nouns.",
//   "what is a conjunction": "A conjunction connects words, phrases, or clauses.",
//   "can you explain idioms": "Yes! Idioms are phrases with figurative meanings different from literal meanings.",
//   "what is an adverb": "An adverb describes a verb, adjective, or another adverb.",
//   "can you teach me phrasal verbs": "Yes! Phrasal verbs are verbs combined with prepositions or adverbs, like 'look up'.",
//   "what is subject-verb agreement": "The subject and verb must match in number and person.",
//   "how do i form questions": "Invert the subject and auxiliary verb, e.g., 'You are happy' → 'Are you happy?'",
//   "how do i use 'some' and 'any'": "'Some' is used in positive sentences, 'any' in questions or negatives.",
//   "what is the difference between 'much' and 'many'": "'Much' is for uncountable nouns, 'many' is for countable nouns.",
//   "can you teach me punctuation": "Yes! I can explain how to use commas, periods, colons, and more.",
//   "how do i write a paragraph": "Start with a topic sentence, add supporting sentences, and end with a conclusion.",
//   "what is active voice": "Active voice is when the subject performs the action of the verb.",
//   "what is passive voice": "Passive voice is when the subject receives the action of the verb.",
//   "can you give me practice exercises": "Yes! I can generate exercises for vocabulary, grammar, and writing.",
//   "how do i use 'will' and 'going to'": "'Will' is for spontaneous decisions, 'going to' is for planned actions.",
//   "what is a relative clause": "A relative clause gives more information about a noun and starts with who, which, or that.",
//   "how do i improve listening skills": "Listen to podcasts, songs, movies, and practice understanding without subtitles.",
//   "can you teach me phonetically": "Yes! I can show phonetic symbols and sounds for accurate pronunciation.",
//   "what are homophones": "Homophones are words that sound the same but have different meanings and spellings.",
//   "can you teach me English idioms": "Of course! I can explain idioms like 'break the ice' or 'hit the nail on the head'.",
//   "what is a modal verb": "Modal verbs express possibility, ability, permission, or obligation, e.g., can, may, must.",
//   "what is a conditional sentence": "A conditional sentence shows cause and effect, e.g., 'If it rains, we will stay home.'",
//   "can you teach me phrasal nouns": "Yes! Phrasal nouns are nouns made from verbs and prepositions, like 'breakup' or 'check-in'.",
//   "what is the difference between 'few' and 'a few'": "'Few' means not many, 'a few' means some.",
//   "how do i improve reading skills": "Read books, articles, and stories, and summarize what you understood.",
//   "can you teach me slang words": "Yes! I can explain common informal words and phrases used in daily conversation.",
//   "how do i use 'since' and 'for'": "'Since' is used with a specific point in time, 'for' with a duration.",
//   "what is a direct object": "A direct object receives the action of the verb in a sentence.",
//   "what is an indirect object": "An indirect object tells to whom or for whom the action is done.",
//   "what is an interjection": "An interjection expresses strong emotion or sudden feeling, e.g., 'Wow!' or 'Ouch!'",
//   "can you help me with essay writing": "Yes! I can guide you on structure, ideas, and language for essays.",
//   "how do i use 'much' and 'many' correctly": "'Much' for uncountable nouns, 'many' for countable nouns.",
//   "what is reported speech": "Reported speech is when you tell what someone said without quoting them directly.",
//   "can you correct my pronunciation": "Absolutely! Say a word, and I will guide you on the correct pronunciation.",
//   "what is a simple sentence": "A simple sentence has only one independent clause.",
//   "what is a complex sentence": "A complex sentence has one independent clause and at least one dependent clause.",
//   "how do i use 'although' and 'though'": "They are used to show contrast in a sentence.",
//   "can you teach me conversation skills": "Yes! I can give dialogues and roleplay exercises for speaking practice.",
//   "what is a prefix": "A prefix is added to the beginning of a word to change its meaning.",
//   "what is a suffix": "A suffix is added to the end of a word to change its form or meaning.",
//   "what is a synonym of 'happy'": "'Joyful', 'cheerful', or 'content' are synonyms of 'happy'.",
//   "what is an antonym of 'difficult'": "'Easy' is the antonym of 'difficult'.",
//   "how do i use 'too' and 'enough'": "'Too' indicates excess, 'enough' indicates sufficiency.",
//   "what is the difference between 'say' and 'tell'": "'Say' focuses on words spoken, 'tell' focuses on informing someone.",
//   "can you teach me about articles": "Yes! 'A', 'an', and 'the' are articles used to specify nouns.",
//   "how do i form negative sentences": "Add 'not' after the auxiliary verb, e.g., 'I do not like ice cream.'",
//   "what is a collective noun": "A collective noun names a group of people, animals, or things, e.g., 'team' or 'flock'.",
//   "how do i use 'somebody' and 'anybody'": "'Somebody' in positive sentences, 'anybody' in questions or negatives.",
//   "can you give me daily English tips": "Yes! I can give you a daily tip to improve your vocabulary, grammar, or speaking.",
//   "what is a compound word": "A compound word is made by combining two words, e.g., 'toothbrush' or 'sunflower'.",
//   "how do i use 'before' and 'after'": "'Before' indicates prior to an event, 'after' indicates following an event.",
//   "what is the difference between 'much' and 'many'": "'Much' for uncountable nouns, 'many' for countable nouns.",
//   "what is a question tag": "A question tag is a short question added at the end of a sentence, e.g., 'You're coming, aren't you?'",
//   "can you teach me story writing": "Yes! I can guide you on plot, characters, and language for writing stories.",
//   "what is an imperative sentence": "An imperative sentence gives a command or instruction.",
//   "how do i use 'although' and 'despite'": "'Although' is followed by a clause, 'despite' is followed by a noun or gerund.",
//   "can you teach me formal and informal English": "Yes! I can show the difference in vocabulary, tone, and sentence structure.",
//   "what is a homonym": "A homonym is a word that has the same spelling or pronunciation as another word but different meaning.",
//   "how do i use 'may' and 'might'": "'May' indicates possibility, 'might' indicates a lower probability.",
//   "what is a sentence subject": "The subject is the person, place, or thing that performs the action of the verb.",
//   "what is a sentence predicate": "The predicate tells what the subject does or is.",
//   "can you help me with TOEFL or IELTS": "Yes! I can provide practice exercises and tips for these English tests.",
//   "how do i use 'if' and 'unless'": "'If' indicates a condition, 'unless' indicates exception or negative condition.",
//   "what is a dangling modifier": "A dangling modifier is a word or phrase that modifies the wrong word or is unclear.",
//   "can you teach me English rhymes": "Yes! I can provide rhyming words and examples to improve phonetics and creativity.",
//   "how do i use 'much' and 'many'": "'Much' for uncountable nouns, 'many' for countable nouns.",
//   "can you teach me conversation starters": "Yes! I can provide phrases and questions to start a conversation naturally.",
//   "what is a demonstrative pronoun": "A demonstrative pronoun points to something specific, e.g., 'this', 'that', 'these', 'those'.",
//   "how do i practice English at home": "Read books, watch English media, speak aloud, and write daily.",
//   "what is a subordinating conjunction": "A subordinating conjunction connects a dependent clause to an independent clause, e.g., 'because', 'although'.",
//   "can you teach me English poetry": "Yes! I can explain rhyme, meter, and literary devices used in poems.",
//   "how do i use 'between' and 'among'": "'Between' for two things, 'among' for more than two.",
//   "what is a compound adjective": "A compound adjective is made by combining two words to describe a noun, e.g., 'well-known author'.",
//   "how do i improve my accent": "Listen to native speakers, repeat sentences, and focus on intonation and stress.",
//   "can you explain phrasal verbs with 'get'": "Yes! Examples: 'get up', 'get along', 'get over'. Each has a different meaning.",
//   "how do i use 'since' and 'because'": "'Since' can show time or reason; 'because' shows reason clearly.",
//   "what is a reflexive pronoun": "A reflexive pronoun refers back to the subject, e.g., 'myself', 'yourself'.",
//   "can you teach me English conversation for travel": "Yes! I can provide common phrases for airports, hotels, and restaurants."
// };



// function speakText(text) {
//   console.log("🔊 Speaking:", text);

//   // Stop listening while the bot is talking
//   try { recognition && recognition.stop(); } catch (e) { console.warn(e); }

//   const synth = window.speechSynthesis;
//   const utter = new SpeechSynthesisUtterance(text);

//   const voices = synth.getVoices();
//   utter.voice = voices.find(v =>
//       v.lang === "en-IN" ||               // English (India)
//       v.name.includes("Indian") ||        // fallback by name
//       v.name.includes("Google") && v.lang === "en-IN"
//   ) || voices[0];

//   // animate mouth if present
//   const robotMouth = document.querySelector('.mouth');
//   if (robotMouth) robotMouth.classList.add('talking');

//   utter.onend = () => {
//     console.log("🔇 Speech ended, restarting recognition...");
//     if (robotMouth) robotMouth.classList.remove('talking');
//     setTimeout(() => {
//       try { recognition && recognition.start(); } catch (e) { console.warn(e); }
//     }, 800); // short delay before listening again
//   };

//   synth.speak(utter);
// }

function speakText(text) {
  console.log("🔊 Speaking:", text);

  // Stop listening while the bot is talking
  try { recognition && recognition.stop(); } catch (e) { console.warn(e); }

  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);

  // Get all available voices
  const voices = synth.getVoices();

  // Detect if the text contains Hindi characters
  const isHindi = /[\u0900-\u097F]/.test(text);

  // Select appropriate voice
  if (isHindi) {
    utter.lang = "hi-IN";
    utter.voice = voices.find(v =>
      v.lang === "hi-IN" || v.name.toLowerCase().includes("hindi")
    ) || voices.find(v => v.lang.startsWith("hi")) || voices[0];
  } else {
    utter.lang = "en-IN";
    utter.voice = voices.find(v =>
      v.lang === "en-IN" || v.name.toLowerCase().includes("indian")
    ) || voices[0];
  }

  utter.rate = 1;  // normal speed
  utter.pitch = 1; // normal tone

  // Animate robot mouth if present
  const robotMouth = document.querySelector('.mouth');
  if (robotMouth) robotMouth.classList.add('talking');

  utter.onend = () => {
    console.log("🔇 Speech ended, restarting recognition...");
    if (robotMouth) robotMouth.classList.remove('talking');
    setTimeout(() => {
      try { recognition && recognition.start(); } catch (e) { console.warn(e); }
    }, 800);
  };

  synth.speak(utter);
}



// Helper: compute string similarity between two texts (0–1)
function similarity(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  const editDist = levenshtein(longer, shorter);
  return (longerLength - editDist) / longerLength;
}

// Helper: Levenshtein distance
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(
        matrix[i - 1][j - 1] + 1, // substitution
        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // insert/delete
      );
    }
  }
  return matrix[b.length][a.length];
}


async function handleUserQuestion(text){
  console.log('🎤 User asked:', text);

  try {
    const res = await fetch('/ask', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({question: text})
    });
    const data = await res.json();

    const qaDisplay = document.getElementById("qa-display");
    qaDisplay.style.display = "block";
    qaDisplay.innerHTML = `<b>Q:</b> ${text}<br><b>A:</b> ${data.answer}`;

    if (data.answer) {
      speakText(data.answer);
      console.log(`✅ Best match: ${data.match || 'none'} (${data.score?.toFixed(1)}%)`);
    }
  } catch(err){
    console.error('Error querying Flask:', err);
  }
}



async function loadModels(){
  const MODEL_URL = '/static/models';
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
}

// === Start Camera ===
async function startCamera(){
  try{
    const stream = await navigator.mediaDevices.getUserMedia({ video:{width:VIDEO_WIDTH,height:VIDEO_HEIGHT}, audio:false });
    video.srcObject = stream;
    await video.play();
    canvas.width = VIDEO_WIDTH; canvas.height = VIDEO_HEIGHT;
  } catch(err){ alert('Please allow camera access.'); }
}

// === Load Known Faces ===
async function loadKnownFaces(){
  const res = await fetch('/known-list');
  const data = await res.json();
  const list = data.images || [];
  for(const file of list){
    const label = file.split('.')[0];
    const img = await faceapi.fetchImage(`/known/${file}`);
    const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({inputSize:TINY_INPUT_SIZE})).withFaceLandmarks().withFaceDescriptor();
    if(detection && detection.descriptor){
      labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(label,[detection.descriptor]));
    }
  }
  if(labeledDescriptors.length) faceMatcher = new faceapi.FaceMatcher(labeledDescriptors,0.6);
}

// === Detection Loop ===
// async function detectionLoop(){
//   if(!video || video.paused || video.ended) return;
//   const detections = await faceapi.detectAllFaces(video,new faceapi.TinyFaceDetectorOptions({inputSize:TINY_INPUT_SIZE,scoreThreshold:SCORE_THRESHOLD})).withFaceLandmarks().withFaceDescriptors();
//   ctx.clearRect(0,0,canvas.width,canvas.height);

//   if(detections.length){
//     const detection = detections[0];
//     const box = detection.detection.box;
//     ctx.strokeStyle = '#00eaff'; ctx.lineWidth=2;
//     ctx.strokeRect(box.x,box.y,box.width,box.height);

//     if(faceMatcher){
//       const best = faceMatcher.findBestMatch(detection.descriptor);
//       const name = best.label==='unknown'? 'Visitor' : best.label;
//       if(!greeted.has(name)){
//         greeted.add(name);
//         speakText(`Hello ${name}, welcome to Melodia 2025!`);
//       }
//       ctx.fillStyle='#00eaff'; ctx.font='14px Arial'; ctx.fillText(name, box.x+4, box.y-6);
//     }
//   }

//   setTimeout(detectionLoop, DETECT_INTERVAL);
// }




// === Detection Loop ===
async function detectionLoop() {
  if (!video || video.paused || video.ended) return;

  const detections = await faceapi
    .detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: TINY_INPUT_SIZE,
        scoreThreshold: SCORE_THRESHOLD,
      })
    )
    .withFaceLandmarks()
    .withFaceDescriptors();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (detections.length) {
    const detection = detections[0];
    const box = detection.detection.box;

    ctx.strokeStyle = "#00eaff";
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    if (faceMatcher) {
      const best = faceMatcher.findBestMatch(detection.descriptor);
      const name = best.label === "unknown" ? "Visitor" : best.label;
      const now = Date.now();

      // Check last greeting time for this person
      const lastSeen = greeted.get(name) || 0;

      // Only greet if enough time has passed
      if (now - lastSeen > GREET_DELAY) {
        if (!greeted.has(name)) {
          speakText(`Hello ${name}, welcome to Melodia 2025!`);
        } else {
          speakText(`Welcome back ${name}!`);
        }
        greeted.set(name, now);
      }

      // Show name label on video
      ctx.fillStyle = "#00eaff";
      ctx.font = "14px Arial";
      ctx.fillText(name, box.x + 4, box.y - 6);
    }
  }

  setTimeout(detectionLoop, DETECT_INTERVAL);
}



// === Voice Recognition ===
function initVoiceRecognition(){
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!window.SpeechRecognition) return alert('Speech Recognition not supported.');

  const recognition = new window.SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.continuous = true;

  recognition.onresult = (event)=>{
    const lastResult = event.results[event.results.length-1];
    if(!lastResult.isFinal) return;
    handleUserQuestion(lastResult[0].transcript.toLowerCase());
  };

  recognition.onerror = (e) => {
    if(e.error === 'no-speech'){
      console.log('🎤 No speech detected.');
      // do not restart immediately, just wait for onend
    } else if(e.error === 'audio-capture'){
      console.log('🎤 Microphone not found or not allowed.');
    } else if(e.error === 'not-allowed'){
      console.log('🎤 Permission to use microphone denied.');
    } else {
      console.error('🎤 Speech recognition error:', e.error);
    }
  };

  recognition.onend = () => {
    console.log('🎤 Speech recognition session ended, restarting in 500ms...');
    setTimeout(()=> recognition.start(), 500); // small delay before restart
  };

  recognition.start();
}

// === Initialize App ===
(async function init(){
  await loadModels();
  await loadKnownFaces();
  await startCamera();
  detectionLoop();
  initVoiceRecognition();
})();
