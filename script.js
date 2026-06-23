const players = {};
let wave = 1;
let zombies = 10;
let baseHp = 100;
let zombieAdvance = 0;

const waveEl = document.getElementById("wave");
const survivorCountEl = document.getElementById("survivorCount");
const zombieCountEl = document.getElementById("zombieCount");
const baseHpEl = document.getElementById("baseHp");
const leaderboardEl = document.getElementById("leaderboard");
const logEl = document.getElementById("log");
const zombieLine = document.getElementById("zombieLine");
const survivorLine = document.getElementById("survivorLine");
const playerNameInput = document.getElementById("playerName");

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
      y: Math.floor(Math.random() * 65) + 10,
      x: Math.floor(Math.random() * 12) + 8,
      action: false
    };
    addLog(`📢 Reinforcement has arrived: ${name}`);
  }
  return players[name];
}

function pulsePlayer(player) {
  player.action = true;
  setTimeout(() => {
    player.action = false;
    render();
  }, 350);
}

function handleCommand(name, command) {
  const player = ensurePlayer(name);

  if (command === "!join") {
    addLog(`🧍 ${player.name} joined the survivor squad.`);
  }

  if (command === "!fight") {
    const kills = Math.floor(Math.random() * 3) + 1;
    zombies = Math.max(0, zombies - kills);
    zombieAdvance = Math.max(0, zombieAdvance - 5);
    player.kills += kills;
    player.xp += kills * 10;
    player.x = Math.min(82, player.x + 6);
    addLog(`⚔️ ${player.name} attacked and defeated ${kills} zombie(s).`);
    pulsePlayer(player);
  }

  if (command === "!heal") {
    player.hp = Math.min(100, player.hp + 25);
    player.xp += 5;
    addLog(`❤️ ${player.name} healed to ${player.hp} HP.`);
    pulsePlayer(player);
  }

  if (command === "!search") {
    const found = Math.floor(Math.random() * 4) + 1;
    player.supplies += found;
    player.xp += found * 5;
    player.x = Math.min(82, player.x + 3);
    addLog(`🎒 ${player.name} found ${found} supplies.`);
    pulsePlayer(player);
  }

  if (command === "!build") {
    const repair = Math.floor(Math.random() * 8) + 5;
    baseHp = Math.min(100, baseHp + repair);
    player.xp += 8;
    player.x = Math.max(5, player.x - 4);
    addLog(`🔨 ${player.name} reinforced the safe house +${repair} HP.`);
    pulsePlayer(player);
  }

  if (command === "!run") {
    player.x = Math.max(5, player.x - 8);
    player.xp += 3;
    addLog(`🏃 ${player.name} ran back toward the safe house.`);
    pulsePlayer(player);
  }

  if (command === "!boost") {
    const kills = Math.floor(Math.random() * 5) + 2;
    zombies = Math.max(0, zombies - kills);
    zombieAdvance = Math.max(0, zombieAdvance - 10);
    player.kills += kills;
    player.xp += kills * 12;
    player.x = Math.min(88, player.x + 10);
    addLog(`⚡ ${player.name} used BOOST and cleared ${kills} zombie(s)!`);
    pulsePlayer(player);
  }

  render();
}

function nextWaveTick() {
  if (zombies > 0) {
    zombieAdvance = Math.min(72, zombieAdvance + 7);
    const damage = Math.floor((zombies * (0.4 + wave * 0.05)));
    if (zombieAdvance >= 60) {
      baseHp = Math.max(0, baseHp - damage);
      addLog(`🧟 Zombies reached the safe house for ${damage} damage!`);
    } else {
      addLog(`🧟 Zombies are moving closer...`);
    }
  } else {
    addLog(`✅ Wave ${wave} cleared! New wave incoming.`);
    wave += 1;
    zombies = 8 + wave * 4;
    zombieAdvance = 0;
    Object.values(players).forEach(p => {
      p.x = Math.max(8, p.x - 18);
      p.xp += 15;
    });
  }

  if (baseHp <= 0) {
    addLog("🚨 Safe house collapsed! Game reset.");
    wave = 1;
    zombies = 10;
    baseHp = 100;
    zombieAdvance = 0;
    Object.values(players).forEach(p => {
      p.hp = 100;
      p.x = Math.floor(Math.random() * 12) + 8;
    });
  }

  render(true);
}

function renderCharacters(attackPulse = false) {
  zombieLine.innerHTML = "";
  survivorLine.innerHTML = "";

  const zombieDisplay = Math.min(zombies, 20);
  for (let i = 0; i < zombieDisplay; i++) {
    const z = document.createElement("div");
    z.className = "zombie" + (attackPulse ? " attack" : "");
    z.textContent = "🧟";
    const row = Math.floor(i / 10);
    z.style.left = `${8 + zombieAdvance + (i % 10) * 3.2}%`;
    z.style.top = `${50 + row * 45}px`;
    zombieLine.appendChild(z);
  }

  Object.values(players).slice(0, 30).forEach((p) => {
    const s = document.createElement("div");
    s.className = "survivor" + (p.action ? " action" : "");
    s.textContent = "🧍";
    s.style.left = `${p.x}%`;
    s.style.bottom = `${80 + p.y * 3}px`;

    const tag = document.createElement("div");
    tag.className = "name-tag";
    tag.textContent = p.name;
    s.appendChild(tag);

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

function render(attackPulse = false) {
  waveEl.textContent = wave;
  survivorCountEl.textContent = Object.keys(players).length;
  zombieCountEl.textContent = zombies;
  baseHpEl.textContent = baseHp;
  renderCharacters(attackPulse);
  renderLeaderboard();
}

document.querySelectorAll("button[data-command]").forEach(button => {
  button.addEventListener("click", () => {
    const name = normalizeName(playerNameInput.value);
    playerNameInput.value = name;
    handleCommand(name, button.dataset.command);
  });
});

setInterval(nextWaveTick, 8000);

addLog("🎮 Enter your name and click Reinforcement Join.");
render();
