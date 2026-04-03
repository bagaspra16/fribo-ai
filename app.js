const DEFAULT_API_URL = 'https://noneleemosynary-subumbellated-yuonne.ngrok-free.dev/v1/chat/completions';
const API_KEY_STORAGE = 'axora_api_url';
const SESSION_KEY = 'axora_sessions';
const MSG_SYSTEM = 'You are Fribo AI, a concise and helpful assistant. Give short, direct answers.';
const MAX_TURNS = 5;

let API_URL = localStorage.getItem(API_KEY_STORAGE) || DEFAULT_API_URL;

// ── GIFs ─────────────────────────────────────────────────────────
const LOADING_GIFS = [
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcThjaWhvNHZzZXhyY283bTVlYml3aHczZGMxd3Exa3Y4bDI3NDR0MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/J1KaQ7nz8P0L3O15L7/giphy.gif',
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmp4bG93NXQ3azR3M2QxeTB2c3J5cXBmbWg5cjBlMGVvajRkdGZxdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TIEh1VS5EYQt5QbODH/giphy.gif',
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExem9pMGN6dnNnOGkxMDZuNGU3ZWViNzRsbzh2MjhtcDd6NTViMWM5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/breOCFHmEm3DO/giphy.gif',
  'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXU4emp5ODRiY294enhhN2pvYjZqdG44NzQyMGF1Nm9ta2hscXBraSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hqkzW7I1klmrC/giphy.gif',
  'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbml3Njh5bmRxZXhrb2ZzOWJodnM1eTJ4d3ZiZzJsMXpxZ2YxamkxOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/28dP8GuqfTq40X7ecG/giphy.gif',
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExpmsycnZ3N3lxZWg4YnZwZW1lOHRuOTRhdDJlMmN0cjE4dW5qcnN1OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Suz1aOqPmGt97cDFJ9/giphy.gif',
  'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzZjcWZobGRtdzVjaHI4aW5kN3d4ZDB0ZXRjajc5OWI2Zjlua29odSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SwOt6VzG8AdlOqDmAO/giphy.gif',
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZWl3cnEyczhua3cydnNmejExNDhzdW5zam83N2d5amsxZXp4dGFzeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/vP5gXvSXJ2olG/giphy.gif',
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZzlwcTRlNzA3NzVydjl2djV0NmV5OHI5YTdocGhtc3o2bHhqbzFwMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7qDHKzYpapPQa6S4/giphy.gif',
];

const THINKING = [
  { lang: 'English', text: 'Still thinking...' },
  { lang: 'Indonesia', text: 'Masih berpikir...' },
  { lang: '日本語', text: 'まだ考えています...' },
  { lang: 'Français', text: 'Je réfléchis encore...' },
  { lang: 'Español', text: 'Aún pensando...' },
  { lang: 'العربية', text: 'لا أزال أفكر...' },
  { lang: '한국어', text: '아직 생각 중...' },
  { lang: 'Deutsch', text: 'Ich denke noch...' },
  { lang: '中文', text: '还在思考中...' },
  { lang: 'Português', text: 'Ainda pensando...' },
];

// ── DOM ──────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const welcomeEl = $('welcome');
const messagesEl = $('messages');
const chatInput = $('chat-input');
const submitBtn = $('submit-btn');
const stopBtn = $('stop-btn');
const clearBtn = $('clear-chat');
const newChatBtn = $('new-chat-btn');
const sidebarEl = $('sidebar');
const sidebarToggle = $('sidebar-toggle');
const sidebarClose = $('sidebar-close-btn');
const greetingEl = $('greeting-text');
const historyEl = $('sidebar-history');
const historyEmpty = $('history-empty');
const suggCards = $('suggestion-cards');
const searchInput = $('search-input');
const statusPip = $('status-pip');
// Settings
const settingsBtn = $('settings-btn');
const settingsModal = $('settings-modal');
const modalClose = $('modal-close');
const apiUrlInput = $('api-url-input');
const testConnBtn = $('test-connection-btn');
const saveBtn = $('save-settings-btn');
const modalStatus = $('modal-status');

// ── State ────────────────────────────────────────────────────────
let isGenerating = false;
let currentSessionId = null;
let messageHistory = [{ role: 'system', content: MSG_SYSTEM }];
let _textIt = null, _gifIt = null;
let currentAbortCtrl = null;

// ── Init ─────────────────────────────────────────────────────────
marked.setOptions({ breaks: true, gfm: true });

(() => {
  const h = new Date().getHours();
  const g = h < 5 ? 'Good Night' : h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : h < 21 ? 'Good Evening' : 'Good Night';
  greetingEl.textContent = `${g}, User.`;
})();

renderHistory();

// Auto-open settings if no URL saved yet
if (!localStorage.getItem(API_KEY_STORAGE)) setTimeout(openSettings, 700);

// ── Session Storage ──────────────────────────────────────────────
function getSessions() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || []; } catch { return []; }
}
function saveSessions(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }

function upsertSession(firstMsg) {
  if (currentSessionId) {
    const ss = getSessions();
    const i = ss.findIndex(s => s.id === currentSessionId);
    if (i !== -1) { ss[i].messages = messageHistory.slice(); saveSessions(ss); }
  } else {
    const id = Date.now().toString();
    const ss = getSessions();
    ss.unshift({ id, title: firstMsg.slice(0, 52), date: new Date().toISOString(), messages: messageHistory.slice() });
    saveSessions(ss);
    currentSessionId = id;
  }
  renderHistory();
}

function deleteSession(id, e) {
  e.stopPropagation();
  if (!confirm('Delete this conversation?')) return;
  const ss = getSessions().filter(s => s.id !== id);
  saveSessions(ss);
  if (currentSessionId === id) showHome();
  else renderHistory();
}

function loadSession(id) {
  const s = getSessions().find(s => s.id === id);
  if (!s) return;
  messagesEl.innerHTML = '';
  messageHistory = s.messages?.length ? s.messages : [{ role: 'system', content: MSG_SYSTEM }];
  currentSessionId = id;
  messageHistory.forEach(m => { if (m.role !== 'system') appendMessage(m.role, m.content, false); });
  welcomeEl.classList.add('hidden');
  suggCards.classList.add('hidden');
  scrollBottom();
  renderHistory();
}

// ── History Render ───────────────────────────────────────────────
function renderHistory(filter = '') {
  const sessions = getSessions().filter(s => !filter || s.title.toLowerCase().includes(filter.toLowerCase()));
  historyEmpty.style.display = sessions.length ? 'none' : 'flex';

  // Remove old groups
  historyEl.querySelectorAll('.history-group').forEach(el => el.remove());

  if (!sessions.length) return;

  const now = new Date();
  const groups = {};
  sessions.forEach(s => {
    const d = Math.floor((now - new Date(s.date)) / 86400000);
    const lbl = d === 0 ? 'Today' : d === 1 ? 'Yesterday' : d < 7 ? `${d} days ago` : new Date(s.date).toLocaleDateString('en', { month: 'short', day: 'numeric' });
    (groups[lbl] = groups[lbl] || []).push(s);
  });

  for (const [lbl, items] of Object.entries(groups)) {
    const grp = document.createElement('div');
    grp.className = 'history-group';
    grp.innerHTML = `<div class="history-label">${lbl}</div>`;
    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'history-item' + (item.id === currentSessionId ? ' is-active' : '');
      el.title = item.title;
      el.innerHTML = `
        <div class="history-item-title">
          <i class="ph ph-chat-teardrop"></i>${item.title}
        </div>
        <button class="history-del-btn" title="Delete chat">
          <i class="ph ph-trash"></i>
        </button>
      `;
      el.addEventListener('click', () => {
        if (!isGenerating) {
          loadSession(item.id);
          if (window.innerWidth <= 700) sidebarEl.classList.add('collapsed');
        }
      });
      el.querySelector('.history-del-btn').addEventListener('click', e => deleteSession(item.id, e));
      grp.appendChild(el);
    });
    historyEl.appendChild(grp);
  }
}

// ── Sidebar / Search ─────────────────────────────────────────────
function checkSidebarMobile() {
  if (window.innerWidth <= 700) sidebarEl.classList.add('collapsed');
}
// Init & window resize handler
checkSidebarMobile();
window.addEventListener('resize', () => {
  if (window.innerWidth <= 700 && !sidebarEl.classList.contains('collapsed')) {
    sidebarEl.classList.add('collapsed');
  }
});

sidebarToggle.addEventListener('click', () => sidebarEl.classList.toggle('collapsed'));
sidebarClose?.addEventListener('click', () => sidebarEl.classList.add('collapsed'));
searchInput.addEventListener('input', () => renderHistory(searchInput.value));

// ── New Chat / Clear ─────────────────────────────────────────────
function showHome() {
  if (isGenerating) return;
  messagesEl.innerHTML = '';
  messageHistory = [{ role: 'system', content: MSG_SYSTEM }];
  currentSessionId = null;
  welcomeEl.classList.remove('hidden');
  suggCards.classList.remove('hidden');
  chatInput.value = '';
  chatInput.style.height = 'auto';
  renderHistory();
  if (window.innerWidth <= 700) sidebarEl.classList.add('collapsed');
}
newChatBtn.addEventListener('click', showHome);
clearBtn.addEventListener('click', showHome);

// ── Suggestion Cards ─────────────────────────────────────────────
document.querySelectorAll('.scard').forEach(c => {
  c.addEventListener('click', () => {
    chatInput.value = c.dataset.prompt;
    chatInput.dispatchEvent(new Event('input'));
    sendMessage();
  });
});

// ── Input ────────────────────────────────────────────────────────
chatInput.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 160) + 'px';
});
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
submitBtn.addEventListener('click', sendMessage);

// ── Scroll ───────────────────────────────────────────────────────
function scrollBottom() {
  const area = $('chat-area');
  area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
}

// ── Slim History ── DIUBAH ────────────────────────────────────────
// Hanya kirim 3 turn terakhir (6 pesan) agar muat di N_CTX=512 token.
// Setiap pesan juga dipotong maksimal 400 karakter agar token tidak meluap.
function slimHistory() {
  const [sys, ...rest] = messageHistory;
  const slim = rest.slice(-6);
  const trimmed = slim.map(m => ({
    role: m.role,
    content: m.content.length > 400 ? m.content.slice(0, 400) + '…' : m.content
  }));
  return [sys, ...trimmed];
}

// ── Append Message ───────────────────────────────────────────────
function appendMessage(role, content, animate = true) {
  const row = document.createElement('div');
  row.className = `msg-row ${role}`;
  if (!animate) { row.style.animation = 'none'; row.style.opacity = '1'; row.style.transform = 'none'; }

  const av = document.createElement('div');
  av.className = `msg-avatar ${role === 'user' ? 'user' : 'ai'}`;
  av.innerHTML = role === 'user' ? '<i class="ph ph-user"></i>' : '<i class="ph-bold ph-sparkle"></i>';

  const bblBody = document.createElement('div');
  bblBody.className = `msg-bubble ${role === 'user' ? 'user' : 'ai'}`;
  bblBody.innerHTML = DOMPurify.sanitize(marked.parse(content));

  const contentCol = document.createElement('div');
  contentCol.style.flex = '1';
  contentCol.style.minWidth = '0';
  contentCol.style.display = 'flex';
  contentCol.style.flexDirection = 'column';
  if (role === 'user') contentCol.style.alignItems = 'flex-end';
  contentCol.appendChild(bblBody);

  // Message Actions Toolbar
  const acts = document.createElement('div');
  acts.className = 'msg-actions';
  acts.id = 'acts-' + Date.now(); // for appending time later

  if (role === 'user') {
    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn-msg-action';
    btnEdit.innerHTML = '<i class="ph ph-pencil-simple"></i> Edit';
    btnEdit.onclick = () => editMessage(content, row);
    acts.appendChild(btnEdit);
  } else {
    const btnCopy = document.createElement('button');
    btnCopy.className = 'btn-msg-action';
    btnCopy.innerHTML = '<i class="ph ph-copy"></i> Copy';
    btnCopy.onclick = () => {
      navigator.clipboard.writeText(content).catch(() => { });
      btnCopy.innerHTML = '<i class="ph ph-check"></i> Copied';
      setTimeout(() => btnCopy.innerHTML = '<i class="ph ph-copy"></i> Copy', 2000);
    };
    acts.appendChild(btnCopy);

    const btnRegen = document.createElement('button');
    btnRegen.className = 'btn-msg-action';
    btnRegen.innerHTML = '<i class="ph ph-arrows-clockwise"></i> Regenerate';
    btnRegen.onclick = () => regenerateResponse(row);
    acts.appendChild(btnRegen);
  }

  contentCol.appendChild(acts);

  row.appendChild(av);
  row.appendChild(contentCol);
  messagesEl.appendChild(row);
  scrollBottom();
}

// ── Edit & Regenerate ────────────────────────────────────────────
function editMessage(originalText, rowElement) {
  if (isGenerating) return;
  const allRows = Array.from(messagesEl.querySelectorAll('.msg-row:not(#typing-indicator)'));
  const idx = allRows.indexOf(rowElement);
  if (idx === -1) return;

  messageHistory = messageHistory.slice(0, idx + 1);
  for (let i = allRows.length - 1; i >= idx; i--) {
    allRows[i].remove();
  }

  chatInput.value = originalText;
  chatInput.dispatchEvent(new Event('input'));
  chatInput.focus();
}

function regenerateResponse(rowElement) {
  if (isGenerating) return;
  const allRows = Array.from(messagesEl.querySelectorAll('.msg-row:not(#typing-indicator)'));
  const idx = allRows.indexOf(rowElement);
  if (idx === -1) return;

  messageHistory = messageHistory.slice(0, idx + 1);
  for (let i = allRows.length - 1; i >= idx; i--) {
    allRows[i].remove();
  }

  sendMessage(true);
}

// ── Loading Indicator ────────────────────────────────────────────
function createLoadingIndicator() {
  const row = document.createElement('div');
  row.className = 'msg-row assistant';
  row.id = 'typing-indicator';

  const av = document.createElement('div');
  av.className = 'msg-avatar ai';
  av.innerHTML = '<i class="ph-bold ph-sparkle"></i>';

  const bbl = document.createElement('div');
  bbl.className = 'msg-bubble ai';
  bbl.style.cssText = 'padding:0;background:transparent;border:none;max-width:280px;';
  bbl.innerHTML = `
    <div class="gif-indicator">
      <img id="thinking-gif" src="${LOADING_GIFS[0]}" alt="thinking" />
      <div id="gif-label" class="gif-label">
        <span id="gif-lang" class="gif-lang"></span>
        <span id="gif-text"></span>
      </div>
    </div>`;
  row.appendChild(av);
  row.appendChild(bbl);
  messagesEl.appendChild(row);
  scrollBottom();

  const labelEl = $('gif-label');
  const textEl = $('gif-text');
  const langEl = $('gif-lang');
  const gifEl = $('thinking-gif');

  // Timer logic
  const timerEl = document.createElement('div');
  timerEl.id = 'gif-timer';
  timerEl.style.fontSize = '0.75rem';
  timerEl.style.color = 'var(--text3)';
  timerEl.innerText = '0.0s';
  $('typing-indicator').appendChild(timerEl);

  let ti = 0;
  window._fetchStartTime = Date.now();

  if (window._fetchTimerInterval) clearInterval(window._fetchTimerInterval);
  window._fetchTimerInterval = setInterval(() => {
    if ($('gif-timer')) {
      $('gif-timer').innerText = ((Date.now() - window._fetchStartTime) / 1000).toFixed(1) + 's';
    }
  }, 100);
  const showText = i => {
    labelEl.style.opacity = '0';
    setTimeout(() => { textEl.textContent = THINKING[i].text; langEl.textContent = THINKING[i].lang; labelEl.style.opacity = '1'; }, 380);
  };
  showText(ti);
  _textIt = setInterval(() => { ti = (ti + 1) % THINKING.length; showText(ti); }, 2200);

  let gi = 0;
  _gifIt = setInterval(() => {
    if (!gifEl) return;
    gifEl.style.opacity = '0';
    setTimeout(() => { gifEl.src = LOADING_GIFS[(++gi) % LOADING_GIFS.length]; gifEl.style.opacity = '1'; }, 480);
  }, 4000);
}

function removeLoadingIndicator() {
  if (_textIt) { clearInterval(_textIt); _textIt = null; }
  if (_gifIt) { clearInterval(_gifIt); _gifIt = null; }
  if (window._fetchTimerInterval) { clearInterval(window._fetchTimerInterval); window._fetchTimerInterval = null; }
  $('typing-indicator')?.remove();
}

// ── Settings Modal ───────────────────────────────────────────────
function openSettings() {
  apiUrlInput.value = API_URL;
  hideModalStatus();
  settingsModal.classList.remove('hidden');
  setTimeout(() => apiUrlInput.select(), 60);
}
function closeSettings() { settingsModal.classList.add('hidden'); }
function hideModalStatus() { modalStatus.className = 'modal-status hidden'; modalStatus.textContent = ''; }
function showModalStatus(type, msg) { modalStatus.className = `modal-status ${type}`; modalStatus.textContent = msg; }

settingsBtn.addEventListener('click', openSettings);
modalClose.addEventListener('click', closeSettings);
settingsModal.addEventListener('click', e => { if (e.target === settingsModal) closeSettings(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSettings(); });

saveBtn.addEventListener('click', () => {
  const url = apiUrlInput.value.trim();
  if (!url) { showModalStatus('err', 'URL cannot be empty.'); return; }
  API_URL = url;
  localStorage.setItem(API_KEY_STORAGE, url);
  showModalStatus('ok', '✓ Saved successfully.');
  setTimeout(closeSettings, 1000);
});

testConnBtn.addEventListener('click', async () => {
  const url = apiUrlInput.value.trim();
  if (!url) { showModalStatus('err', 'Enter a URL first.'); return; }
  showModalStatus('info', 'Testing…');
  testConnBtn.disabled = true;
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch(url, {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }], max_tokens: 5, temperature: 0.1 })
    });
    if (res.ok) {
      showModalStatus('ok', `✓ Connected — HTTP ${res.status}`);
      statusPip.className = 'status-pip ok';
    } else {
      showModalStatus('err', `✗ Server returned HTTP ${res.status}`);
      statusPip.className = 'status-pip err';
    }
  } catch (err) {
    statusPip.className = 'status-pip err';
    if (err.name === 'AbortError') showModalStatus('err', '✗ Timeout — server not reachable.');
    else showModalStatus('err', `✗ Failed to fetch. Check URL, ngrok status, or CORS.`);
  } finally { testConnBtn.disabled = false; }
});

// ── Stop Generation ──────────────────────────────────────────────
stopBtn.addEventListener('click', () => {
  if (currentAbortCtrl) {
    currentAbortCtrl.abort();
    currentAbortCtrl = null;
  }
});

// ── Send ── DIUBAH ────────────────────────────────────────────────
async function sendMessage(isRegeneration = false) {
  let text = chatInput.value.trim();
  if (!isRegeneration && !text || isGenerating) return;

  // Lock
  isGenerating = true;
  chatInput.value = '';
  chatInput.style.height = 'auto';
  chatInput.disabled = true;
  submitBtn.classList.add('hidden');
  stopBtn.classList.remove('hidden');

  // Switch to chat view
  if (!welcomeEl.classList.contains('hidden')) {
    welcomeEl.classList.add('hidden');
    suggCards.classList.add('hidden');
  }

  if (!isRegeneration) {
    appendMessage('user', text);
    messageHistory.push({ role: 'user', content: text });
  } else {
    text = messageHistory[messageHistory.length - 1].content;
  }

  createLoadingIndicator();

  currentAbortCtrl = new AbortController();

  // DIUBAH: 90 detik — cukup untuk model lambat, tidak membiarkan user menunggu sia-sia
  const tid = setTimeout(() => currentAbortCtrl.abort(), 180_000); // 3 menit — server tidak cancel inference

  // DIUBAH: fetch options dibuat terpisah agar bisa dipakai ulang saat retry
  const fetchOpts = {
    method: 'POST',
    signal: currentAbortCtrl.signal,
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
    // DIUBAH: max_tokens diturunkan 300→180, temperature dihapus (pakai default server 0.7)
    body: JSON.stringify({ messages: slimHistory(), max_tokens: 120 }), // turun 180→120 sesuai server v4
  };

  try {
    // DIUBAH: fetch pertama
    let res = await fetch(API_URL, fetchOpts);

    // DIUBAH: retry otomatis 1x jika server sedang sibuk atau RAM rendah
    if ((res.status === 503 || res.status === 429) && !currentAbortCtrl.signal.aborted) {
      removeLoadingIndicator();
      createLoadingIndicator();
      await new Promise(r => setTimeout(r, 3000)); // tunggu 3 detik lalu coba lagi
      res = await fetch(API_URL, { ...fetchOpts, signal: currentAbortCtrl.signal });
    }

    if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);

    const data = await res.json();
    console.log('[api]', data);

    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      data?.response ||
      '_(No response from model)_';

    removeLoadingIndicator();
    const finalTime = ((Date.now() - window._fetchStartTime) / 1000).toFixed(1);
    appendMessage('ai', reply);

    // Add final time to the last AI message formatting
    const allActs = messagesEl.querySelectorAll('.msg-actions');
    const lastAct = allActs[allActs.length - 1]; // the one we just appended
    if (lastAct) {
      const timeSpan = document.createElement('span');
      timeSpan.style.fontSize = '0.68rem';
      timeSpan.style.color = 'var(--text3)';
      timeSpan.style.marginLeft = 'auto'; // push to the right
      timeSpan.style.padding = '4px 6px';
      timeSpan.innerText = `Generated in ${finalTime}s`;
      lastAct.appendChild(timeSpan);
    }

    messageHistory.push({ role: 'assistant', content: reply });
    upsertSession(text);
    statusPip.className = 'status-pip ok';

  } catch (err) {
    removeLoadingIndicator();
    clearTimeout(tid);
    console.error('[fetch]', err);
    statusPip.className = 'status-pip err';

    let msg;
    if (err.name === 'AbortError') {
      msg = '⏱️ **Request timed out.** The model took too long. Try a shorter question.';
    } else if (err.message.toLowerCase().includes('failed to fetch') || err.message.toLowerCase().includes('load failed') || err.message.toLowerCase().includes('network')) {
      msg = '⚠️ **Cannot reach the API.**\n\n- 🔄 ngrok URL may have **expired** — click ⚙ Settings to update\n- 🔴 Local AI server may not be **running**\n- 🌐 If opening via `file://`, use `python3 -m http.server 3000` instead';
    } else {
      msg = `⚠️ **Error:** ${err.message}`;
    }
    appendMessage('assistant', msg);
  } finally {
    clearTimeout(tid);
    isGenerating = false;
    currentAbortCtrl = null;
    chatInput.disabled = false;
    submitBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
    chatInput.focus();
  }
}