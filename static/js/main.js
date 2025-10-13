// // 🎤 Global speech recognizer
// let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
// recognition.continuous = true;
// recognition.interimResults = false;
// recognition.lang = "en-US";


// const VIDEO_WIDTH = 480;
// const VIDEO_HEIGHT = 360;
// const DETECT_INTERVAL = 400;
// const TINY_INPUT_SIZE = 160;
// const SCORE_THRESHOLD = 0.5;
// const CONFIDENCE_THRESHOLD = 0.60; // 95% confidence threshold - ADDED THIS LINE

// // Store last greeted times
// const GREET_DELAY = 30000; // 15 seconds

// const video = document.getElementById('video');
// const canvas = document.getElementById('overlay');
// const ctx = canvas.getContext('2d');
// const robotMouth = document.querySelector('.mouth');

// let faceMatcher = null;
// let labeledDescriptors = [];
// // let greeted = new Set();

// const greeted = new Map();



// // function speakText(text) {
// //   console.log("🔊 Speaking:", text);

// //   // Stop listening while the bot is talking
// //   try { recognition && recognition.stop(); } catch (e) { console.warn(e); }

// //   const synth = window.speechSynthesis;
// //   const utter = new SpeechSynthesisUtterance(text);

// //   const voices = synth.getVoices();
// //   utter.voice = voices.find(v =>
// //       v.lang === "en-IN" ||               // English (India)
// //       v.name.includes("Indian") ||        // fallback by name
// //       v.name.includes("Google") && v.lang === "en-IN"
// //   ) || voices[0];

// //   // animate mouth if present
// //   const robotMouth = document.querySelector('.mouth');
// //   if (robotMouth) robotMouth.classList.add('talking');

// //   utter.onend = () => {
// //     console.log("🔇 Speech ended, restarting recognition...");
// //     if (robotMouth) robotMouth.classList.remove('talking');
// //     setTimeout(() => {
// //       try { recognition && recognition.start(); } catch (e) { console.warn(e); }
// //     }, 800); // short delay before listening again
// //   };

// //   synth.speak(utter);
// // }

// function speakText(text) {
//   console.log("🔊 Speaking:", text);

//   // Stop listening while the bot is talking
//   try { recognition && recognition.stop(); } catch (e) { console.warn(e); }

//   const synth = window.speechSynthesis;
//   const utter = new SpeechSynthesisUtterance(text);

//   // Get all available voices
//   const voices = synth.getVoices();

//   // Detect if the text contains Hindi characters
//   const isHindi = /[\u0900-\u097F]/.test(text);

//   // Select appropriate voice
//   if (isHindi) {
//     utter.lang = "hi-IN";
//     utter.voice = voices.find(v =>
//       v.lang === "hi-IN" || v.name.toLowerCase().includes("hindi")
//     ) || voices.find(v => v.lang.startsWith("hi")) || voices[0];
//   } else {
//     utter.lang = "en-IN";
//     utter.voice = voices.find(v =>
//       v.lang === "en-IN" || v.name.toLowerCase().includes("indian")
//     ) || voices[0];
//   }

//   utter.rate = 1;  // normal speed
//   utter.pitch = 1; // normal tone

//   // Animate robot mouth if present
//   const robotMouth = document.querySelector('.mouth');
//   if (robotMouth) robotMouth.classList.add('talking');

//   utter.onend = () => {
//     console.log("🔇 Speech ended, restarting recognition...");
//     if (robotMouth) robotMouth.classList.remove('talking');
//     setTimeout(() => {
//       try { recognition && recognition.start(); } catch (e) { console.warn(e); }
//     }, 800);
//   };

//   synth.speak(utter);
// }



// // Helper: compute string similarity between two texts (0–1)
// function similarity(a, b) {
//   a = a.toLowerCase();
//   b = b.toLowerCase();
//   const longer = a.length > b.length ? a : b;
//   const shorter = a.length > b.length ? b : a;
//   const longerLength = longer.length;
//   if (longerLength === 0) return 1.0;
//   const editDist = levenshtein(longer, shorter);
//   return (longerLength - editDist) / longerLength;
// }

// // Helper: Levenshtein distance
// function levenshtein(a, b) {
//   const matrix = [];
//   for (let i = 0; i <= b.length; i++) matrix[i] = [i];
//   for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
//   for (let i = 1; i <= b.length; i++) {
//     for (let j = 1; j <= a.length; j++) {
//       if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
//       else matrix[i][j] = Math.min(
//         matrix[i - 1][j - 1] + 1, // substitution
//         Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // insert/delete
//       );
//     }
//   }
//   return matrix[b.length][a.length];
// }


// async function handleUserQuestion(text){
//   console.log('🎤 User asked:', text);

//   try {
//     const res = await fetch('/ask', {
//       method: 'POST',
//       headers: {'Content-Type': 'application/json'},
//       body: JSON.stringify({question: text})
//     });
//     const data = await res.json();

//     const qaDisplay = document.getElementById("qa-display");
//     qaDisplay.style.display = "block";
//     qaDisplay.innerHTML = `<b>Q:</b> ${text}<br><b>A:</b> ${data.answer}`;

//     if (data.answer) {
//       speakText(data.answer);
//       console.log(`✅ Best match: ${data.match || 'none'} (${data.score?.toFixed(1)}%)`);
//     }
//   } catch(err){
//     console.error('Error querying Flask:', err);
//   }
// }



// async function loadModels(){
//   const MODEL_URL = '/static/models';
//   await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
//   await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
//   await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
// }

// // === Start Camera ===
// async function startCamera(){
//   try{
//     const stream = await navigator.mediaDevices.getUserMedia({ video:{width:VIDEO_WIDTH,height:VIDEO_HEIGHT}, audio:false });
//     video.srcObject = stream;
//     await video.play();
//     canvas.width = VIDEO_WIDTH; canvas.height = VIDEO_HEIGHT;
//   } catch(err){ alert('Please allow camera access.'); }
// }

// // === Load Known Faces ===
// async function loadKnownFaces(){
//   const res = await fetch('/known-list');
//   const data = await res.json();
//   const list = data.images || [];
//   for(const file of list){
//     const label = file.split('.')[0];
//     const img = await faceapi.fetchImage(`/known/${file}`);
//     const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({inputSize:TINY_INPUT_SIZE})).withFaceLandmarks().withFaceDescriptor();
//     if(detection && detection.descriptor){
//       labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(label,[detection.descriptor]));
//     }
//   }
//   if(labeledDescriptors.length) faceMatcher = new faceapi.FaceMatcher(labeledDescriptors,0.6);
// }

// // === Detection Loop ===
// async function detectionLoop() {
//   if (!video || video.paused || video.ended) return;

//   const detections = await faceapi
//     .detectAllFaces(
//       video,
//       new faceapi.TinyFaceDetectorOptions({
//         inputSize: TINY_INPUT_SIZE,
//         scoreThreshold: SCORE_THRESHOLD,
//       })
//     )
//     .withFaceLandmarks()
//     .withFaceDescriptors();

//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   if (detections.length) {
//     const detection = detections[0];
//     const box = detection.detection.box;

//     ctx.strokeStyle = "#00eaff";
//     ctx.lineWidth = 2;
//     ctx.strokeRect(box.x, box.y, box.width, box.height);

//     if (faceMatcher) {
//       const best = faceMatcher.findBestMatch(detection.descriptor);
//       const confidence = 1 - best.distance; // Convert distance to confidence (0-1)
      
//       // MODIFIED THIS PART: Use name only if confidence >= 95%, otherwise use "Visitor"
//       const displayName = (best.label !== "unknown" && confidence >= CONFIDENCE_THRESHOLD) 
//         ? best.label 
//         : "Visitor";
      
//       const now = Date.now();

//       // Check last greeting time for this person
//       const lastSeen = greeted.get(displayName) || 0;

//       // Only greet if enough time has passed
//       if (now - lastSeen > GREET_DELAY) {
//         if (!greeted.has(displayName)) {
//           speakText(`Hello ${displayName}, welcome to Melodia 2025!`);
//         } else {
//           speakText(`Welcome back ${displayName}!`);
//         }
//         greeted.set(displayName, now);
//       }

//       // Show name label on video with confidence percentage
//       ctx.fillStyle = "#00eaff";
//       ctx.font = "14px Arial";
//       const labelText = `${displayName} (${Math.round(confidence * 100)}%)`;
//       ctx.fillText(labelText, box.x + 4, box.y - 6);
      
//       console.log(`👤 Detected: ${best.label}, Confidence: ${Math.round(confidence * 100)}%, Display: ${displayName}`);
//     }
//   }

//   setTimeout(detectionLoop, DETECT_INTERVAL);
// }

// // === Voice Recognition ===
// function initVoiceRecognition(){
//   window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//   if(!window.SpeechRecognition) return alert('Speech Recognition not supported.');

//   const recognition = new window.SpeechRecognition();
//   recognition.lang = 'en-US';
//   recognition.interimResults = false;
//   recognition.continuous = true;

//   recognition.onresult = (event)=>{
//     const lastResult = event.results[event.results.length-1];
//     if(!lastResult.isFinal) return;
//     handleUserQuestion(lastResult[0].transcript.toLowerCase());
//   };

//   recognition.onerror = (e) => {
//     if(e.error === 'no-speech'){
//       console.log('🎤 No speech detected.');
//       // do not restart immediately, just wait for onend
//     } else if(e.error === 'audio-capture'){
//       console.log('🎤 Microphone not found or not allowed.');
//     } else if(e.error === 'not-allowed'){
//       console.log('🎤 Permission to use microphone denied.');
//     } else {
//       console.error('🎤 Speech recognition error:', e.error);
//     }
//   };

//   recognition.onend = () => {
//     console.log('🎤 Speech recognition session ended, restarting in 500ms...');
//     setTimeout(()=> recognition.start(), 500); // small delay before restart
//   };

//   recognition.start();
// }

// // === Initialize App ===
// (async function init(){
//   await loadModels();
//   await loadKnownFaces();
//   await startCamera();
//   detectionLoop();
//   initVoiceRecognition();
// })();




// // 🎤 Global speech recognizer
// let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
// recognition.continuous = true;
// recognition.interimResults = false;
// recognition.lang = "en-US";

// const VIDEO_WIDTH = 480;
// const VIDEO_HEIGHT = 360;
// const DETECT_INTERVAL = 400;
// const TINY_INPUT_SIZE = 160;
// const SCORE_THRESHOLD = 0.5;
// const CONFIDENCE_THRESHOLD = 0.60;

// // Store last greeted times
// const GREET_DELAY = 30000; // 15 seconds

// const video = document.getElementById('video');
// const canvas = document.getElementById('overlay');
// const ctx = canvas.getContext('2d');
// const robotMouth = document.querySelector('.mouth');

// let faceMatcher = null;
// let labeledDescriptors = [];
// const greeted = new Map();

// function speakText(text) {
//   console.log("🔊 Speaking:", text);

//   // Stop listening while the bot is talking
//   try { 
//     if (recognition && recognition.state === 'listening') {
//       recognition.stop();
//       console.log('🎤 Recognition stopped for speaking');
//     }
//   } catch (e) { 
//     console.warn("Error stopping recognition:", e); 
//   }

//   const synth = window.speechSynthesis;
//   const utter = new SpeechSynthesisUtterance(text);

//   // Get all available voices
//   const voices = synth.getVoices();

//   // Detect if the text contains Hindi characters
//   const isHindi = /[\u0900-\u097F]/.test(text);

//   // Select appropriate voice
//   if (isHindi) {
//     utter.lang = "hi-IN";
//     utter.voice = voices.find(v =>
//       v.lang === "hi-IN" || v.name.toLowerCase().includes("hindi")
//     ) || voices.find(v => v.lang.startsWith("hi")) || voices[0];
//   } else {
//     utter.lang = "en-IN";
//     utter.voice = voices.find(v =>
//       v.lang === "en-IN" || v.name.toLowerCase().includes("indian")
//     ) || voices[0];
//   }

//   utter.rate = 0.9;
//   utter.pitch = 1;

//   // Animate robot mouth if present
//   const robotMouth = document.querySelector('.mouth');
//   if (robotMouth) robotMouth.classList.add('talking');

//   utter.onend = () => {
//     console.log("🔇 Speech ended");
//     if (robotMouth) robotMouth.classList.remove('talking');
    
//     // Restart recognition after speech
//     setTimeout(() => {
//       try {
//         recognition.start();
//         console.log('🎤 Recognition restarted after speech');
//       } catch (e) {
//         console.log('🎤 Recognition already running');
//       }
//     }, 1000);
//   };

//   utter.onerror = (event) => {
//     console.error('Speech synthesis error:', event.error);
//     if (robotMouth) robotMouth.classList.remove('talking');
//   };

//   synth.speak(utter);
// }

// async function handleUserQuestion(text){
//   console.log('🎤 User asked:', text);

//   try {
//     const res = await fetch('/ask', {
//       method: 'POST',
//       headers: {'Content-Type': 'application/json'},
//       body: JSON.stringify({question: text})
//     });
    
//     if (!res.ok) {
//       throw new Error(`Server error: ${res.status}`);
//     }
    
//     const data = await res.json();

//     const qaDisplay = document.getElementById("qa-display");
//     if (qaDisplay) {
//       qaDisplay.style.display = "block";
//       qaDisplay.innerHTML = `<b>Q:</b> ${text}<br><b>A:</b> ${data.answer}`;
//     }

//     if (data.answer) {
//       speakText(data.answer);
//       console.log(`✅ Best match: ${data.match || 'none'} (${data.score?.toFixed(1)}%)`);
//     }
//   } catch(err){
//     console.error('Error querying Flask:', err);
//     speakText("Sorry, I'm having trouble connecting to the server. Please try again.");
//   }
// }

// async function loadModels(){
//   const MODEL_URL = '/static/models';
//   await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
//   await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
//   await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
// }

// async function startCamera(){
//   try{
//     const stream = await navigator.mediaDevices.getUserMedia({ 
//       video: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT }, 
//       audio: false 
//     });
//     video.srcObject = stream;
//     await video.play();
//     canvas.width = VIDEO_WIDTH; 
//     canvas.height = VIDEO_HEIGHT;
//   } catch(err){ 
//     console.error('Camera error:', err);
//     alert('Please allow camera access.'); 
//   }
// }

// async function loadKnownFaces(){
//   try {
//     const res = await fetch('/known-list');
//     const data = await res.json();
//     const list = data.images || [];
//     for(const file of list){
//       const label = file.split('.')[0];
//       const img = await faceapi.fetchImage(`/known/${file}`);
//       const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({inputSize:TINY_INPUT_SIZE})).withFaceLandmarks().withFaceDescriptor();
//       if(detection && detection.descriptor){
//         labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(label,[detection.descriptor]));
//       }
//     }
//     if(labeledDescriptors.length) {
//       faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
//       console.log(`✅ Loaded ${labeledDescriptors.length} known faces`);
//     }
//   } catch (err) {
//     console.error('Error loading known faces:', err);
//   }
// }

// async function detectionLoop() {
//   if (!video || video.paused || video.ended) {
//     setTimeout(detectionLoop, DETECT_INTERVAL);
//     return;
//   }

//   try {
//     const detections = await faceapi
//       .detectAllFaces(
//         video,
//         new faceapi.TinyFaceDetectorOptions({
//           inputSize: TINY_INPUT_SIZE,
//           scoreThreshold: SCORE_THRESHOLD,
//         })
//       )
//       .withFaceLandmarks()
//       .withFaceDescriptors();

//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     if (detections.length) {
//       const detection = detections[0];
//       const box = detection.detection.box;

//       ctx.strokeStyle = "#00eaff";
//       ctx.lineWidth = 2;
//       ctx.strokeRect(box.x, box.y, box.width, box.height);

//       if (faceMatcher) {
//         const best = faceMatcher.findBestMatch(detection.descriptor);
//         const confidence = 1 - best.distance;
        
//         const displayName = (best.label !== "unknown" && confidence >= CONFIDENCE_THRESHOLD) 
//           ? best.label 
//           : "Visitor";
        
//         const now = Date.now();
//         const lastSeen = greeted.get(displayName) || 0;

//         if (now - lastSeen > GREET_DELAY) {
//           if (displayName === "Visitor") {
//             speakText(`Hello Visitor, welcome to Melodia 2025!`);
//           } else {
//             if (!greeted.has(displayName)) {
//               speakText(`Hello ${displayName}, welcome to Melodia 2025!`);
//             } else {
//               speakText(`Welcome back ${displayName}!`);
//             }
//           }
//           greeted.set(displayName, now);
//         }

//         ctx.fillStyle = "#00eaff";
//         ctx.font = "14px Arial";
//         const labelText = `${displayName} (${Math.round(confidence * 100)}%)`;
//         ctx.fillText(labelText, box.x + 4, box.y - 6);
        
//         // console.log(`👤 Detected: ${best.label}, Confidence: ${Math.round(confidence * 100)}%, Display: ${displayName}`);
//       }
//     }
//   } catch (err) {
//     console.error('Detection error:', err);
//   }

//   setTimeout(detectionLoop, DETECT_INTERVAL);
// }

// function initVoiceRecognition(){
//   if(!window.SpeechRecognition && !window.webkitSpeechRecognition) {
//     console.warn('Speech Recognition not supported.');
//     return;
//   }

//   recognition.onresult = (event) => {
//     const lastResult = event.results[event.results.length - 1];
//     if(!lastResult.isFinal) return;
    
//     const transcript = lastResult[0].transcript.trim().toLowerCase();
//     console.log('🎤 User asked:', transcript);
    
//     if(transcript.length > 0) {
//       handleUserQuestion(transcript);
//     }
//   };

//   recognition.onerror = (e) => {
//     console.log('🎤 Speech recognition error:', e.error);
//   };

//   recognition.onend = () => {
//     console.log('🎤 Speech recognition ended, restarting...');
//     setTimeout(() => {
//       try {
//         recognition.start();
//       } catch (e) {
//         console.log('🎤 Recognition already started');
//       }
//     }, 500);
//   };

//   try {
//     recognition.start();
//     console.log('🎤 Speech recognition started');
//   } catch (e) {
//     console.log('🎤 Recognition already running');
//   }
// }

// // === Initialize App ===
// (async function init(){
//   await loadModels();
//   await loadKnownFaces();
//   await startCamera();
//   detectionLoop();
//   initVoiceRecognition();
// })();











// 🎤 Global speech recognizer
let recognition = null;
let isSpeaking = false;
let recognitionStoppedForSpeaking = false;
let lastSpokenText = "";
let ignoreSimilarSpeech = false;

const VIDEO_WIDTH = 480;
const VIDEO_HEIGHT = 360;
const DETECT_INTERVAL = 400;
const TINY_INPUT_SIZE = 160;
const SCORE_THRESHOLD = 0.5;
const CONFIDENCE_THRESHOLD = 0.60;

// Store last greeted times
const GREET_DELAY = 300000; // 15 seconds

const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const robotMouth = document.querySelector('.mouth');

let faceMatcher = null;
let labeledDescriptors = [];
const greeted = new Map();

// 🆕 Function to initialize speech recognition
function initializeSpeechRecognition() {
    if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
        console.error('❌ Speech Recognition not supported in this browser.');
        return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure recognition settings
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        console.log('🎤 Speech recognition started - Microphone is active');
    };

    recognition.onresult = (event) => {
        // Don't process results if we're speaking
        if (isSpeaking) {
            console.log('🎤 Ignoring speech input while speaking');
            return;
        }
        
        // Don't process if we're ignoring similar speech
        if (ignoreSimilarSpeech) {
            console.log('🎤 Ignoring speech during echo prevention period');
            return;
        }
        
        const lastResult = event.results[event.results.length - 1];
        if(!lastResult.isFinal) return;
        
        const transcript = lastResult[0].transcript.trim().toLowerCase();
        console.log('🎤 User asked:', transcript);
        
        if(transcript.length > 0) {
            handleUserQuestion(transcript);
        }
    };

    recognition.onerror = (e) => {
        console.log('🎤 Speech recognition error:', e.error);
        
        // Handle specific errors
        switch(e.error) {
            case 'not-allowed':
            case 'permission-denied':
                console.error('❌ Microphone permission denied. Please allow microphone access.');
                alert('Please allow microphone access to use voice commands.');
                break;
            case 'audio-capture':
                console.error('❌ No microphone found.');
                break;
            case 'network':
                console.error('❌ Network error in speech recognition.');
                break;
            default:
                console.error('🎤 Other speech recognition error:', e.error);
        }
    };

    recognition.onend = () => {
        console.log('🎤 Speech recognition ended');
        
        // Don't restart if we're speaking OR if we stopped it for speaking
        if (!isSpeaking && !recognitionStoppedForSpeaking) {
            setTimeout(() => {
                try {
                    recognition.start();
                    console.log('🎤 Recognition restarted normally');
                } catch (e) {
                    console.log('🎤 Error restarting recognition:', e);
                }
            }, 1000);
        } else if (recognitionStoppedForSpeaking) {
            console.log('🎤 Not restarting - stopped for speaking');
        } else {
            console.log('🎤 Not restarting - currently speaking');
        }
    };

    return recognition;
}

// function speakText(text) {
//     console.log("🔊 Speaking:", text);
    
//     if (isSpeaking) {
//         console.log("🔊 Already speaking, skipping...");
//         return;
//     }
    
//     isSpeaking = true;
//     recognitionStoppedForSpeaking = false;
//     lastSpokenText = text;
//     ignoreSimilarSpeech = true;

//     // Stop listening while the bot is talking
//     try { 
//         if (recognition && recognition.state === 'listening') {
//             recognition.stop();
//             recognitionStoppedForSpeaking = true;
//             console.log('🎤 Recognition stopped for speaking');
//         }
//     } catch (e) { 
//         console.warn("Error stopping recognition:", e); 
//     }

//     const synth = window.speechSynthesis;
    
//     // Cancel any ongoing speech
//     synth.cancel();

//     const utter = new SpeechSynthesisUtterance(text);

//     // Get all available voices
//     const voices = synth.getVoices();

//     // Detect if the text contains Hindi characters
//     const isHindi = /[\u0900-\u097F]/.test(text);

//     // Select appropriate voice
//     if (isHindi) {
//         utter.lang = "hi-IN";
//         utter.voice = voices.find(v =>
//             v.lang === "hi-IN" || v.name.toLowerCase().includes("hindi")
//         ) || voices.find(v => v.lang.startsWith("hi")) || voices[0];
//     } else {
//         utter.lang = "en-IN";
//         utter.voice = voices.find(v =>
//             v.lang === "en-IN" || v.name.toLowerCase().includes("indian")
//         ) || voices[0];
//     }

//     utter.rate = 0.9;
//     utter.pitch = 1;

//     // Animate robot mouth if present
//     const robotMouth = document.querySelector('.mouth');
//     if (robotMouth) robotMouth.classList.add('talking');

//     utter.onend = () => {
//         console.log("🔇 Speech ended");
//         isSpeaking = false;
//         if (robotMouth) robotMouth.classList.remove('talking');
        
//         // Reset the ignore flag after a delay
//         setTimeout(() => {
//             ignoreSimilarSpeech = false;
//             console.log('🎤 Now ready to listen again');
//         }, 3000);
        
//         // Restart recognition only if we stopped it for speaking
//         if (recognitionStoppedForSpeaking) {
//             setTimeout(() => {
//                 try {
//                     recognition.start();
//                     console.log('🎤 Recognition restarted after speech');
//                 } catch (e) {
//                     console.log('🎤 Recognition already running or cannot start');
//                 }
//             }, 2000);
//         }
//     };

//     utter.onerror = (event) => {
//         console.error('Speech synthesis error:', event.error);
//         isSpeaking = false;
//         ignoreSimilarSpeech = false;
//         if (robotMouth) robotMouth.classList.remove('talking');
        
//         // Still try to restart recognition if we stopped it
//         if (recognitionStoppedForSpeaking) {
//             setTimeout(() => {
//                 try {
//                     recognition.start();
//                 } catch (e) {
//                     console.log('🎤 Recognition already running');
//                 }
//             }, 1000);
//         }
//     };

//     synth.speak(utter);
// }




// Function to check if speech is similar to what we just spoke


function speakText(text) {
    console.log("🔊 Speaking:", text);
    
    if (isSpeaking) {
        console.log("🔊 Already speaking, skipping...");
        return;
    }
    
    isSpeaking = true;
    recognitionStoppedForSpeaking = false;
    lastSpokenText = text;
    ignoreSimilarSpeech = true;

    // Stop listening while the bot is talking
    try { 
        if (recognition && recognition.state === 'listening') {
            recognition.stop();
            recognitionStoppedForSpeaking = true;
            console.log('🎤 Recognition stopped for speaking');
        }
    } catch (e) { 
        console.warn("Error stopping recognition:", e); 
    }

    const synth = window.speechSynthesis;
    
    // Cancel any ongoing speech
    synth.cancel();

    const utter = new SpeechSynthesisUtterance(text);

    // Get all available voices
    const voices = synth.getVoices();

    // Detect if the text contains Hindi characters
    const isHindi = /[\u0900-\u097F]/.test(text);

    // 🆕 FIX: Check for common words that might be spelled out
    const normalizedText = text.toLowerCase().trim();
    
    // 🆕 List of words that should be pronounced properly, not spelled out
    const commonWords = {
        'mam': 'madam',
        'm a m': 'madam', 
        'm.a.m': 'madam',
        'sir': 'sir',
        's i r': 'sir',
        's.i.r': 'sir',
        'dr': 'doctor',
        'd r': 'doctor',
        'd.r': 'doctor',
        'mr': 'mister',
        'm r': 'mister',
        'm.r': 'mister',
        'mrs': 'missus',
        'm r s': 'missus',
        'm.r.s': 'missus',
        'ms': 'miss',
        'm s': 'miss',
        'm.s': 'miss'
    };

    // 🆕 Replace spelled-out words with their proper pronunciation
    let finalText = text;
    for (const [spelled, spoken] of Object.entries(commonWords)) {
        if (normalizedText.includes(spelled)) {
            finalText = finalText.replace(new RegExp(spelled, 'gi'), spoken);
            console.log(`🔤 Fixed pronunciation: ${spelled} -> ${spoken}`);
        }
    }

    utter.text = finalText; // 🆕 Use the corrected text

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

    utter.rate = 0.9;
    utter.pitch = 1;

    // Animate robot mouth if present
    const robotMouth = document.querySelector('.mouth');
    if (robotMouth) robotMouth.classList.add('talking');

    utter.onend = () => {
        console.log("🔇 Speech ended");
        isSpeaking = false;
        if (robotMouth) robotMouth.classList.remove('talking');
        
        // Reset the ignore flag after a delay
        setTimeout(() => {
            ignoreSimilarSpeech = false;
            console.log('🎤 Now ready to listen again');
        }, 3000);
        
        // Restart recognition only if we stopped it for speaking
        if (recognitionStoppedForSpeaking) {
            setTimeout(() => {
                try {
                    recognition.start();
                    console.log('🎤 Recognition restarted after speech');
                } catch (e) {
                    console.log('🎤 Recognition already running or cannot start');
                }
            }, 2000);
        }
    };

    utter.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        isSpeaking = false;
        ignoreSimilarSpeech = false;
        if (robotMouth) robotMouth.classList.remove('talking');
        
        // Still try to restart recognition if we stopped it
        if (recognitionStoppedForSpeaking) {
            setTimeout(() => {
                try {
                    recognition.start();
                } catch (e) {
                    console.log('🎤 Recognition already running');
                }
            }, 1000);
        }
    };

    synth.speak(utter);
}



function isSimilarToLastSpoken(text) {
    if (!lastSpokenText) return false;
    
    const spokenWords = lastSpokenText.toLowerCase().split(/\s+/);
    const inputWords = text.toLowerCase().split(/\s+/);
    
    let matchCount = 0;
    for (const word of inputWords) {
        if (spokenWords.some(spokenWord => spokenWord.includes(word) || word.includes(spokenWord))) {
            matchCount++;
        }
    }
    
    const similarity = matchCount / Math.max(inputWords.length, spokenWords.length);
    return similarity > 0.3;
}

async function handleUserQuestion(text){
    console.log('🎤 User asked:', text);

    // Don't process if we're currently speaking
    if (isSpeaking) {
        console.log('🎤 Ignoring question while speaking');
        return;
    }
    
    // Don't process if the speech is similar to what we just spoke (echo prevention)
    if (ignoreSimilarSpeech && isSimilarToLastSpoken(text)) {
        console.log('🎤 Ignoring similar speech (likely echo):', text);
        return;
    }

    try {
        const res = await fetch('/ask', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({question: text})
        });
        
        if (!res.ok) {
            let errorMessage = "Sorry, I'm having trouble connecting to the server.";
            try {
                const errorData = await res.json();
                if (errorData.answer) {
                    errorMessage = errorData.answer;
                }
            } catch (e) {
                // If cannot parse error response, use default message
            }
            speakText(errorMessage);
            return;
        }
        
        const data = await res.json();

        const qaDisplay = document.getElementById("qa-display");
        if (qaDisplay) {
            qaDisplay.style.display = "block";
            qaDisplay.innerHTML = `<b>Q:</b> ${text}<br><b>A:</b> ${data.answer}`;
        }

        if (data.answer) {
            speakText(data.answer);
            console.log(`✅ Best match: ${data.match || 'none'} (${data.score?.toFixed(1)}%)`);
        } else {
            speakText("I didn't get a proper response. Please try again.");
        }
    } catch(err){
        console.error('Error querying Flask:', err);
        speakText("Sorry, I'm having trouble connecting to the server. Please try again.");
    }
}

async function loadModels(){
    const MODEL_URL = '/static/models';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
}

async function startCamera(){
    try{
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT }, 
            audio: false 
        });
        video.srcObject = stream;
        await video.play();
        canvas.width = VIDEO_WIDTH; 
        canvas.height = VIDEO_HEIGHT;
    } catch(err){ 
        console.error('Camera error:', err);
        alert('Please allow camera access.'); 
    }
}

async function loadKnownFaces(){
    try {
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
        if(labeledDescriptors.length) {
            faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
            console.log(`✅ Loaded ${labeledDescriptors.length} known faces`);
        }
    } catch (err) {
        console.error('Error loading known faces:', err);
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
                            speakText(`Welcome back ${displayName}!`);
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

// 🆕 Function to start voice recognition with user permission
async function initVoiceRecognition(){
    console.log('🎤 Initializing speech recognition...');
    
    // Check browser support
    if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
        console.error('❌ Speech Recognition API not supported in this browser.');
        alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
        return;
    }

    try {
        // 🆕 First request microphone permission
        console.log('🎤 Requesting microphone permission...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ Microphone permission granted');
        
        // Stop the audio stream (we just needed permission)
        stream.getTracks().forEach(track => track.stop());
        
        // Initialize speech recognition
        recognition = initializeSpeechRecognition();
        
        if (recognition) {
            // Start recognition after a short delay
            setTimeout(() => {
                try {
                    recognition.start();
                    console.log('✅ Speech recognition started successfully');
                } catch (e) {
                    console.error('❌ Failed to start speech recognition:', e);
                    alert('Failed to start speech recognition. Please refresh the page and allow microphone access.');
                }
            }, 1000);
        }
        
    } catch (err) {
        console.error('❌ Microphone permission denied or error:', err);
        alert('Microphone access is required for voice commands. Please allow microphone access and refresh the page.');
    }
}

// === Initialize App ===
(async function init(){
    console.log('🚀 Initializing application...');
    
    try {
        await loadModels();
        console.log('✅ AI models loaded');
        
        await loadKnownFaces();
        console.log('✅ Face recognition loaded');
        
        await startCamera();
        console.log('✅ Camera started');
        
        detectionLoop();
        console.log('✅ Face detection started');
        
        // Initialize voice recognition last
        await initVoiceRecognition();
        console.log('✅ Application initialized successfully');
        
    } catch (err) {
        console.error('❌ Application initialization failed:', err);
    }
})();