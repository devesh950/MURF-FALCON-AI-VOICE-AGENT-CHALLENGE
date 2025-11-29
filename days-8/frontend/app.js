/* Minimal Voice Game Master prototype
 - Uses Web Speech API (SpeechRecognition) for STT (fallback to text input if unavailable)
 - Uses speechSynthesis for TTS
 - Maintains a simple JSON world state and history
 - Keeps conversation continuity for 8-15 exchanges by attaching history to messages
*/

const startBtn = document.getElementById('startBtn');
const speakBtn = document.getElementById('speakBtn');
const restartBtn = document.getElementById('restartBtn');
const gmMessages = document.getElementById('gmMessages');
const playerTranscript = document.getElementById('playerTranscript');
const universeSelect = document.getElementById('universe');
const statePanel = document.getElementById('statePanel');
const toggleState = document.getElementById('toggleState');

let recognition = null;
let listening = false;
let history = [];
let world = {location: 'village square', players: [], turn: 1};
let exchangeCount = 0;

function appendGM(text){
  const el = document.createElement('div');
  el.className = 'gm ff-bubble';
  el.textContent = text;
  gmMessages.appendChild(el);
  gmMessages.scrollTop = gmMessages.scrollHeight;
}
function appendPlayer(text){
  const el = document.createElement('div');
  el.className = 'player ff-bubble ff-bubble-player';
  el.textContent = text;
  playerTranscript.appendChild(el);
  playerTranscript.scrollTop = playerTranscript.scrollHeight;
}

function speakText(text){
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 1.0;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function createPrompt(playerText){
  const prompt = `You are a creative Game Master for a ${universeSelect.value} scenario. Keep scenes short and vivid. Maintain a consistent world state in JSON: ${JSON.stringify(world)}. Player said: "${playerText}". Respond with a short narration (1-3 sentences) and end by asking "What do you do next?". Also include a one-line JSON_UPDATE block that describes any changes to the world state in JSON.`;
  return prompt;
}


async function callLocalLLM(prompt, playerText) {
  // Call backend API for GM response
  try {
    const res = await fetch('http://localhost:8008/api/gm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history,
        world,
        universe: universeSelect.value,
        player_input: playerText
      })
    });
    if (!res.ok) throw new Error('Backend error');
    const data = await res.json();
    return data;
  } catch (e) {
    return { narration: '[Backend unavailable] ' + e.message, update: { ...world, turn: world.turn + 1 } };
  }
}

async function onPlayerInput(text){
  appendPlayer(text);
  history.push({role: 'player', text});
  exchangeCount++;


  const prompt = createPrompt(text);
  appendGM('...thinking...');
  const res = await callLocalLLM(prompt, text);
  // remove the '...thinking...' placeholder
  gmMessages.lastChild.remove();

  // apply update
  Object.assign(world, res.update);
  appendGM(res.narration);
  speakText(res.narration);
  history.push({role:'gm', text: res.narration});
  updateStatePanel();

  // manage lifecycle: stop after 15 exchanges
  if (exchangeCount >= 15){
    appendGM('Session complete. Thanks for playing!');
    speakText('Session complete. Thanks for playing!');
    speakBtn.disabled = true;
  }
}

function updateStatePanel(){
  statePanel.textContent = JSON.stringify(world, null, 2);
}

startBtn.onclick = () => {
  world = {location: universeSelect.value === 'fantasy' ? 'village square' : universeSelect.value === 'sci-fi' ? 'derelict shuttle' : 'old manor', players: [{name:'Player1', hp:10}], turn: 1};
  history = [];
  exchangeCount = 0;
  gmMessages.innerHTML = '';
  playerTranscript.innerHTML = '';
  updateStatePanel();
  startBtn.disabled = true;
  speakBtn.disabled = false;
  restartBtn.disabled = false;
  appendGM('Welcome, adventurer. ' + (universeSelect.value === 'fantasy' ? 'You stand in the village square as market stalls creak in the wind.' : universeSelect.value === 'sci-fi' ? 'You awaken to blinking consoles in a derelict shuttle.' : 'The candles sputter in the dusty manor hall.'));
  speakText(gmMessages.lastChild.textContent);
};

restartBtn.onclick = () => {
  startBtn.disabled = false;
  speakBtn.disabled = true;
  restartBtn.disabled = true;
  gmMessages.innerHTML = '';
  playerTranscript.innerHTML = '';
  statePanel.classList.add('hidden');
};

toggleState.onclick = () => {
  statePanel.classList.toggle('hidden');
};

speakBtn.onclick = async () => {
  // Use Web Speech API if available
  if (!recognition && 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (ev) => {
      const text = ev.results[0][0].transcript;
      onPlayerInput(text);
    };
    recognition.onerror = (ev) => {
      appendPlayer('[Speech recognition error] ' + ev.error);
    };
    recognition.onend = () => { listening = false; speakBtn.textContent = 'Speak'; };
  }

  if (recognition){
    if (!listening){
      recognition.start();
      listening = true;
      speakBtn.textContent = 'Listening... (click to stop)';
    } else {
      recognition.stop();
      listening = false;
      speakBtn.textContent = 'Speak';
    }
  } else {
    // fallback prompt
    const text = prompt('Type your action:');
    if (text) await onPlayerInput(text);
  }
};

// Initialize state panel hidden
updateStatePanel();
statePanel.classList.add('hidden');

console.log('Day 8 prototype loaded');
