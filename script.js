const players = {};
let wave = 1;
let zombies = 10;
let baseHp = 100;

const waveEl = document.getElementById("wave");
const survivorCountEl = document.getElementById("survivorCount");
const zombieCountEl = document.getElementById("zombieCount");
const baseHpEl = document.getElementById("baseHp");
const leaderboardEl = document.getElementById("leaderboard");
const logEl = document.getElementById("log");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const zombieLine = document.getElementById("zombieLine");
const survivorLine = document.getElementById("survivorLine");

function addLog(message) {
  const row = document.createElement("div");
  row.textContent = message;
  logEl.prepend(row);
}

function normalizeName(name) {
  return name.trim().slice(0, 18) || "Viewer";
}

function ensurePlayer(name) {
  name = normalizeName(name);
  if (!players[name]) {
    players[name] = {
      name,
      hp: 100,
      xp: 0,
      kills: 0,
      supplies: 0,
      alive: true
    };
    addLog(`📢 Reinforcement has arrived: ${name}`);
  }
  return players[name];
}

function handleCommand(name, command) {
  const player = ensurePlayer(name);

  if (command === "!join") {
    addLog(`🧍 ${player.name} joined the survivor squad.`);
  } else if (command === "!fight") {
    const kills = Math.floor(Math.random() * 3) + 1;
    zombies = Math.max(0, zombies - kills);
    player.kills += kills;
    player.xp += kills * 10;
    addLog(`⚔️ ${player.name} fought bravely and defeated ${kills} zombie(s).`);
  } else if (command === "!heal") {
    player.hp = Math.min(100, player.hp + 25);
    player.xp += 5;
    addLog(`❤️ ${player.name} healed and is now at ${player.hp} HP.`);
  } else if (command === "!search") {
    const found = Math.floor(Math.random() * 4) + 1;
    player.supplies += found;
    player.xp += found * 5;
    addLog(`🎒 ${player.name} searched and found ${found} supplies.`);
  } else if (command === "!build") {
    const repair = Math.floor(Math.random() * 8) + 5;
    baseHp = Math.min(100, baseHp + repair);
    player.xp += 8;
    addLog(`🔨 ${player.name} reinforced the safe house +${repair} HP.`);
  } else if (command === "!run") {
    player.xp += 3;
    addLog(`🏃 ${player.name} escaped danger and survived this moment.`);
  } else {
    addLog(`❓ ${player.name} used unknown command: ${command}`);
  }

  render();
}

function parseChatLine(text) {
  const parts = text.split(":");
  if (parts.length < 2) return null;
  const name = normalizeName(parts[0]);
  const command = parts.slice(1).join(":").trim().toLowerCase().split(" ")[0];
  return { name, command };
}

function nextWave() {
  if (zombies > 0) {
    const damage = Math.floor(zombies * (Math.random() * 1.8 + 0.8));
    baseHp = Math.max(0, baseHp - damage);
    addLog(`🧟 Wave ${wave} attacked the safe house for ${damage} damage!`);
  } else {
    addLog(`✅ Wave ${wave} cleared! Survivors gained momentum.`);
    wave += 1;
    zombies = 8 + wave * 4;
  }

  if (baseHp <= 0) {
    addLog("🚨 Safe house collapsed! Resetting survival camp...");
    wave = 1;
    zombies = 10;
    baseHp = 100;
    Object.values(players).forEach(p => {
      p.hp = 100;
      p.supplies = 0;
    });
  }

  render();
}

function renderCharacters() {
  zombieLine.innerHTML = "";
  survivorLine.innerHTML = "";

  const zombieDisplay = Math.min(zombies, 18);
  for (let i = 0; i < zombieDisplay; i++) {
    const z = document.createElement("div");
    z.className = "zombie";
    z.textContent = "🧟";
    z.style.left = `${5 + (i % 9) * 10}%`;
    z.style.top = `${35 + Math.floor(i / 9) * 45}px`;
    zombieLine.appendChild(z);
  }

  const survivorNames = Object.keys(players).slice(0, 18);
  survivorNames.forEach((name, i) => {
    const s = document.createElement("div");
    s.className = "survivor";
    s.title = name;
    s.textContent = "🧍";
    s.style.left = `${5 + (i % 9) * 10}%`;
    s.style.bottom = `${95 + Math.floor(i / 9) * 45}px`;
    survivorLine.appendChild(s);
  });
}

function renderLeaderboard() {
  leaderboardEl.innerHTML = "";
  const sorted = Object.values(players)
    .sort((a, b) => b.xp - a.xp || b.kills - a.kills)
    .slice(0, 10);

  sorted.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.name} — XP ${p.xp}, Kills ${p.kills}`;
    leaderboardEl.appendChild(li);
  });
}

function render() {
  waveEl.textContent = wave;
  survivorCountEl.textContent = Object.keys(players).length;
  zombieCountEl.textContent = zombies;
  baseHpEl.textContent = baseHp;
  renderCharacters();
  renderLeaderboard();
}

sendBtn.addEventListener("click", () => {
  const parsed = parseChatLine(chatInput.value);
  if (parsed) {
    handleCommand(parsed.name, parsed.command);
    chatInput.value = "";
  } else {
    addLog("Type like this: Mike: !join");
  }
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

setInterval(nextWave, 30000);

addLog("🎮 Game started. Type Mike: !join to test.");
render();
