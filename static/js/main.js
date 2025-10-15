// 🎤 Global speech recognizer
let recognition = null;
let isSpeaking = false;
let recognitionStoppedForSpeaking = false;
let lastSpokenText = "";
let ignoreSimilarSpeech = false;
let recognitionPaused = false;
let lastSpeechTime = 0;
let cooldownActive = false;


const VIDEO_WIDTH = 480;
const VIDEO_HEIGHT = 360;
const DETECT_INTERVAL = 800; // ⚡ Reduced CPU load
const TINY_INPUT_SIZE = 160;
const SCORE_THRESHOLD = 0.5;
const CONFIDENCE_THRESHOLD = 0.60;
const GREET_DELAY = 60000; // 30 seconds

const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const robotMouth = document.querySelector('.mouth');

let faceMatcher = null;
let labeledDescriptors = [];
const greeted = new Map();

// 🗣️ Voice preload and caching
let availableVoices = [];


function loadVoices() {
    return new Promise((resolve) => {
        const synth = window.speechSynthesis;
        let id = setInterval(() => {
            const voices = synth.getVoices();
            if (voices.length !== 0) {
                availableVoices = voices;
                clearInterval(id);
                console.log("✅ Voices loaded:", voices.length);
                resolve(voices);
            }
        }, 100);
    });
}

window.speechSynthesis.onvoiceschanged = () => {
    availableVoices = window.speechSynthesis.getVoices();
    console.log("✅ Voices refreshed:", availableVoices.length);
};

// Trigger preload early
window.addEventListener('load', () => {
    window.speechSynthesis.getVoices();
});

// 🎤 Initialize speech recognition
function initializeSpeechRecognition() {
  if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
    console.error('❌ Speech Recognition not supported.');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recog = new SpeechRecognition();

  recog.continuous = true;
  recog.interimResults = false;
  recog.lang = 'en-IN';
  recog.maxAlternatives = 1;

  recog.onstart = () => {
    console.log('🎤 Recognition started');
    lastSpeechTime = Date.now();
  };

  recog.onresult = (event) => {
    if (isSpeaking || cooldownActive) return; // 🚫 ignore bot voice
    const last = event.results[event.results.length - 1];
    if (!last.isFinal) return;
    const transcript = last[0].transcript.trim().toLowerCase();
    if (transcript.length) {
      console.log("🎧 Heard:", transcript);
      lastSpeechTime = Date.now();
      handleUserQuestion(transcript);
    }
  };

  recog.onerror = (e) => {
    console.warn('🎤 Recognition error:', e.error);
  };

  recog.onend = () => {
    console.warn('⚠️ Recognition ended unexpectedly');
    if (!isSpeaking && !recognitionPaused) {
      setTimeout(() => {
        try {
          recog.start();
          console.log('🔁 Auto-restarted speech recognition');
        } catch (e) {
          console.warn('Restart failed:', e);
        }
      }, 1000);
    }
  };

  return recog;
}

// 🎤 Voice recognition initializer
async function initVoiceRecognition() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => t.stop());

    recognition = initializeSpeechRecognition();
    if (recognition) {
      recognition.start();
      console.log('✅ Voice recognition active');
      startRecognitionWatchdog();
    }
  } catch (err) {
    console.error('❌ Microphone error:', err);
    alert('Microphone access required.');
  }
}

// 🔊 Speak function (prevents self-hearing)
async function speakText(text) {
  console.log("🔊 Speaking:", text);
  if (isSpeaking) return;

  isSpeaking = true;
  recognitionPaused = true;
  cooldownActive = true;
  lastSpokenText = text;

  try { recognition && recognition.stop(); } catch {}

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-IN';
  utter.rate = 1.0;
  utter.pitch = 1.0;

  utter.onstart = () => {
    console.log("🗣️ Speaking started");
    if (robotMouth) robotMouth.classList.add('talking');
  };

  utter.onend = () => {
    console.log("🔇 Speech ended");
    isSpeaking = false;
    if (robotMouth) robotMouth.classList.remove('talking');

    setTimeout(() => {
      cooldownActive = false;
      recognitionPaused = false;
      try { recognition.start(); } catch {}
    }, 1500);
  };

  utter.onerror = (e) => {
    console.error("Speech error:", e);
    isSpeaking = false;
    recognitionPaused = false;
  };

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// 🛡️ Watchdog to keep mic alive
function startRecognitionWatchdog() {
  setInterval(() => {
    if (!recognition || recognitionPaused || isSpeaking) return;

    const now = Date.now();
    // If no speech detected for 10s or recognition stopped silently
    if (now - lastSpeechTime > 10000) {
      console.warn("🎤 Restarting mic due to inactivity...");
      try {
        recognition.stop();
        setTimeout(() => recognition.start(), 500);
      } catch (e) {
        console.warn("🎤 Watchdog restart failed:", e);
      }
      lastSpeechTime = now;
    }
  }, 5000); // check every 5 seconds
}


// 🔎 Helper for echo prevention
function isSimilarToLastSpoken(text) {
    if (!lastSpokenText) return false;
    const spokenWords = lastSpokenText.toLowerCase().split(/\s+/);
    const inputWords = text.toLowerCase().split(/\s+/);
    let matchCount = 0;
    for (const word of inputWords) {
        if (spokenWords.some(w => w.includes(word) || word.includes(w))) matchCount++;
    }
    return matchCount / Math.max(inputWords.length, spokenWords.length) > 0.3;
}

// 🧠 Handle user question
async function handleUserQuestion(text) {
    if (isSpeaking) return;
    if (ignoreSimilarSpeech && isSimilarToLastSpoken(text)) return;

    try {
        const res = await fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: text })
        });

        const data = await res.json();

        const qaDisplay = document.getElementById("qa-display");
        if (qaDisplay) {
            qaDisplay.style.display = "block";
            qaDisplay.innerHTML = `<b>Q:</b> ${text}<br><b>A:</b> ${data.answer}`;
        }

        speakText(data.answer || "Sorry, I didn’t get that. Please try again.");
    } catch (err) {
        console.error('❌ Error querying Flask:', err);
        // speakText("Sorry, I’m having trouble connecting to the server.");
    }
}

// 😎 Face recognition
async function loadModels() {
    const MODEL_URL = '/static/models';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
            audio: false
        });
        video.srcObject = stream;
        await video.play();
        canvas.width = VIDEO_WIDTH;
        canvas.height = VIDEO_HEIGHT;
    } catch (err) {
        console.error('Camera error:', err);
        alert('Please allow camera access.');
    }
}

// async function loadKnownFaces() {
//     try {
//         const res = await fetch('/known-list');
//         const data = await res.json();
//         for (const file of data.images || []) {
//             const label = file.split('.')[0];
//             const img = await faceapi.fetchImage(`/known/${file}`);
//             const detection = await faceapi
//                 .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: TINY_INPUT_SIZE }))
//                 .withFaceLandmarks()
//                 .withFaceDescriptor();
//             if (detection) labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(label, [detection.descriptor]));
//         }
//         if (labeledDescriptors.length)
//             faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
//     } catch (err) {
//         console.error('Error loading known faces:', err);
//     }
// }

async function loadKnownFaces() {
    try {
        const res = await fetch('/encodings');
        const data = await res.json();

        labeledDescriptors = data.names.map((name, i) => {
            return new faceapi.LabeledFaceDescriptors(
                name,
                [new Float32Array(data.encodings[i])]
            );
        });

        if (labeledDescriptors.length) {
            faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
            console.log(`✅ Loaded ${labeledDescriptors.length} trained faces`);
        }
    } catch (err) {
        console.error('Error loading trained encodings:', err);
    }
}



async function detectionLoop() {
    if (!video || video.paused || video.ended) {
        setTimeout(detectionLoop, DETECT_INTERVAL);
        return;
    }

    try {
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
                const confidence = 1 - best.distance;

                const displayName = (best.label !== "unknown" && confidence >= CONFIDENCE_THRESHOLD)
                    ? best.label
                    : "Visitor";

                const now = Date.now();
                const lastSeen = greeted.get(displayName) || 0;

                // Don't greet if we're currently speaking
                if ((now - lastSeen > GREET_DELAY) && !isSpeaking) {
                    if (displayName === "Visitor") {
                        speakText(`Hello Visitor, welcome to Melodia 2025!`);
                    } else {
                        if (!greeted.has(displayName)) {
                            speakText(`Hello ${displayName}, welcome to Melodia 2025!`);
                        } else {
                            speakText(`Welcome back ${displayName}!, How can I help you?`);
                        }
                    }
                    greeted.set(displayName, now);
                }

                ctx.fillStyle = "#00eaff";
                ctx.font = "14px Arial";
                const labelText = `${displayName} (${Math.round(confidence * 100)}%)`;
                ctx.fillText(labelText, box.x + 4, box.y - 6);

                // console.log(`👤 Detected: ${best.label}, Confidence: ${Math.round(confidence * 100)}%, Display: ${displayName}`);
            }
        }
    } catch (err) {
        console.error('Detection error:', err);
    }

    setTimeout(detectionLoop, DETECT_INTERVAL);
}

// 🎤 Start recognition
async function initVoiceRecognition() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        recognition = initializeSpeechRecognition();
        if (recognition) {
            setTimeout(() => recognition.start(), 1000);
            console.log('✅ Voice recognition active');
        }
    } catch (err) {
        console.error('❌ Microphone error:', err);
        alert('Microphone access required.');
    }
}

// 🚀 Initialize app
(async function init() {
    console.log('🚀 Starting application...');
    await loadModels();
    await loadKnownFaces();
    await startCamera();
    detectionLoop();
    await initVoiceRecognition();
    console.log('✅ Application ready');
})();
