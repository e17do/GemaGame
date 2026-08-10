// ========================================
// GEMA PRIME
// Game State
// ========================================

// ---------------------------
// Global Game State
// ---------------------------
let paused = false;
let gameOver = false;
let freezeMs = 0;
let timeScale = 1;
let chroma = 0;


// ---------------------------
// Run State
// ---------------------------
const run = {
  score: 0,
  level: 1,
  wave: 1,
  pellets: 0,
  hits: 0,
  empsUsed: 0,
  startTime: performance.now(),
  timeMs: 0,
  earnedShards: 0,
  comboCount: 0,
  comboTimer: 0,
  comboMul: 1,
  doubleScore: 0,
  shield: 0,
  infiniteEMP: 0,
  lastRadarUse: 0
};


// ---------------------------
// Player State
// ---------------------------
const player = {
  x: 0,
  y: 0,
  r: 8,
  hp: 100,
  maxHp: 100,
  speed: 4.0,
  invuln: 0,
  vx: 0,
  vy: 0
};


// ---------------------------
// Radar State
// ---------------------------
const radar = {
  active: false,
  radius: 0,
  opacity: 0,
  power: 18
};


// ---------------------------
// EMP State
// ---------------------------
const emp = {
  ready: true,
  cd: 9500,
  radius: 220,
  t: 0
};


// ---------------------------
// Entity Collections
// ---------------------------
const enemies = [];
const pellets = [];
const bigPellets = [];
const particles = [];
const powerUps = [];
const floatingTexts = [];
const bossShots = [];


// ---------------------------
// Ammo State
// ---------------------------
let ammo = 0;
const maxAmmo = 24;
