// ========================================
// GEMA PRIME
// Upgrade System
// ========================================

// ---------------------------
// Upgrade definitions
// ---------------------------

const upgrades = [
  {
    id: "speed",
    name: "Speed",
    base: 120,
    max: 12,
    apply: (lvl) => {
      persistent.up.speed = 4 + lvl * 0.28;
    }
  },

  {
    id: "maxHp",
    name: "Max HP",
    base: 140,
    max: 12,
    apply: (lvl) => {
      persistent.up.maxHp = 100 + lvl * 12;
    }
  },

  {
    id: "empCd",
    name: "EMP Cooldown",
    base: 180,
    max: 10,
    apply: (lvl) => {
      persistent.up.empCd =
        Math.max(3200, 9500 - lvl * 620);
    }
  },

  {
    id: "empRadius",
    name: "EMP Radius",
    base: 160,
    max: 10,
    apply: (lvl) => {
      persistent.up.empRadius =
        220 + lvl * 18;
    }
  },

  {
    id: "magnet",
    name: "Magnet",
    base: 130,
    max: 10,
    apply: (lvl) => {
      persistent.up.magnet =
        lvl * 0.16;
    }
  }
];

// ---------------------------
// Upgrade levels
// ---------------------------

const upgradeLv = STORE.get(
  PKEY + "_uplv",
  {
    speed: 0,
    maxHp: 0,
    empCd: 0,
    empRadius: 0,
    magnet: 0
  },
  SECRET
);

// ---------------------------
// Upgrade cost
// ---------------------------

function upgradeCost(id) {
  const u = upgrades.find(
    x => x.id === id
  );

  if (!u) {
    return Infinity;
  }

  const lvl =
    upgradeLv[id] || 0;

  return Math.floor(
    u.base * Math.pow(1.55, lvl)
  );
}

// ---------------------------
// Apply upgrades
// ---------------------------

function applyUpgrades() {
  for (const u of upgrades) {
    u.apply(
      upgradeLv[u.id] || 0
    );
  }

  // Sync persistent upgrade values
  // to the runtime player.
  if (typeof player !== "undefined") {
    player.speed =
      persistent.up.speed;

    player.maxHp =
      persistent.up.maxHp;

    if (player.hp > player.maxHp) {
      player.hp =
        player.maxHp;
    }
  }

  // Sync EMP runtime values.
  if (typeof emp !== "undefined") {
    emp.cd =
      persistent.up.empCd;

    emp.radius =
      persistent.up.empRadius;
  }

  STORE.set(
    PKEY,
    persistent,
    SECRET
  );

  STORE.set(
    PKEY + "_uplv",
    upgradeLv,
    SECRET
  );
}

// ---------------------------
// Upgrade descriptions
// ---------------------------

const upgradeDescriptions = {
  speed:
    "Increase player movement speed.",

  maxHp:
    "Increase maximum player HP.",

  empCd:
    "Reduce EMP cooldown.",

  empRadius:
    "Increase EMP blast radius.",

  magnet:
    "Increase automatic pellet attraction range."
};

// ---------------------------
// Upgrade Shop UI
// ---------------------------

function renderUpgradeShop() {
  el.shopShards.textContent =
    String(persistent.shards | 0);

  el.shopGrid.innerHTML =
    upgrades.map(u => {
      const lvl =
        upgradeLv[u.id] || 0;

      const maxed =
        lvl >= u.max;

      const cost =
        maxed
          ? 0
          : upgradeCost(u.id);

      const canBuy =
        !maxed &&
        persistent.shards >= cost;

      return `
        <div class="upgradeCard">

          <div class="upgradeTop">
            <div class="upgradeName">
              ${u.name}
            </div>

            <div class="upgradeLevel">
              LV ${lvl}/${u.max}
            </div>
          </div>

          <div class="upgradeDesc">
            ${
              upgradeDescriptions[u.id] ||
              "Improve this system."
            }
          </div>

          <div class="upgradeCost">
            ${
              maxed
                ? "MAX LEVEL"
                : `COST: ${cost} SHARDS`
            }
          </div>

          <button
            class="btn ${canBuy ? "primary" : ""}"
            data-upgrade="${u.id}"
            ${canBuy ? "" : "disabled"}>
            ${maxed ? "MAXED" : "UPGRADE"}
          </button>

        </div>
      `;
    }).join("");
}

// ---------------------------
// Upgrade Shop state
// ---------------------------

let shopPreviousPaused = false;

// ---------------------------
// Open shop
// ---------------------------

function openUpgradeShop() {
  shopPreviousPaused =
    paused;

  paused = true;

  renderUpgradeShop();

  el.shopOverlay.style.display =
    "grid";
}

// ---------------------------
// Close shop
// ---------------------------

function closeUpgradeShop() {
  el.shopOverlay.style.display =
    "none";

  if (!gameOver) {
    paused =
      shopPreviousPaused;
  }

  updateUI();
}

// ---------------------------
// Buy upgrade
// ---------------------------

function buyUpgrade(id) {
  const u =
    upgrades.find(
      x => x.id === id
    );

  if (!u) {
    return;
  }

  const lvl =
    upgradeLv[id] || 0;

  if (lvl >= u.max) {
    toast(
      u.name +
      " sudah MAX."
    );

    return;
  }

  const cost =
    upgradeCost(id);

  if (persistent.shards < cost) {
    toast(
      "Shards tidak cukup."
    );

    sfx({
      f: 120,
      t: "square",
      d: 0.08,
      v: 0.05,
      bend: -30,
      noise: 0.10
    });

    HAPTICS.pattern(
      "miss"
    );

    return;
  }

  persistent.shards -=
    cost;

  upgradeLv[id] =
    lvl + 1;

  applyUpgrades();

  toast(
    `${u.name} upgraded → LV ${upgradeLv[id]}`
  );

  sfx({
    f:
      520 +
      upgradeLv[id] * 35,
    t: "triangle",
    d: 0.12,
    v: 0.07,
    bend: 140
  });

  HAPTICS.pattern(
    "upgrade"
  );

  renderUpgradeShop();

  updateUI();
}
