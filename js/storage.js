// ========================================
// GEMA PRIME
// Persistent Storage / Save System
// ========================================

const STORE = {
  hash(str) {
    let h = 2166136261;

    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }

    return (h >>> 0).toString(16);
  },

  pack(obj, secret) {
    const payload = JSON.stringify(obj);
    const sig = STORE.hash(payload + "|" + secret);

    return btoa(
      JSON.stringify({
        payload,
        sig
      })
    );
  },

  unpack(raw, fallback, secret) {
    try {
      const { payload, sig } = JSON.parse(atob(raw));

      if (STORE.hash(payload + "|" + secret) !== sig) {
        return fallback;
      }

      return JSON.parse(payload);
    } catch {
      return fallback;
    }
  },

  get(k, fallback, secret) {
    const v = localStorage.getItem(k);

    return v == null
      ? fallback
      : STORE.unpack(v, fallback, secret);
  },

  set(k, obj, secret) {
    try {
      localStorage.setItem(
        k,
        STORE.pack(obj, secret)
      );
    } catch {}
  }
};

// ========================================
// Save Schema
// ========================================

const SAVE_VERSION = 1;

function createDefaultSave() {
  return {
    version: SAVE_VERSION,

    shards: 0,
    best: 0,

    skins: {
      unlocked: ["neo"],
      equipped: "neo"
    },

    daily: {
      day: "",
      streak: 0,
      missions: [],
      claimed: false
    },

    up: {
      speed: 4.0,
      maxHp: 100,
      empCd: 9500,
      empRadius: 220,
      magnet: 0
    },

    achievements: {}
  };
}

function normalizeSave(data) {
  const defaults = createDefaultSave();

  if (!data || typeof data !== "object") {
    return defaults;
  }

  return {
    version: SAVE_VERSION,

    shards:
      Number.isFinite(data.shards)
        ? Math.max(0, data.shards)
        : defaults.shards,

    best:
      Number.isFinite(data.best)
        ? Math.max(0, data.best)
        : defaults.best,

    skins: {
      unlocked:
        Array.isArray(data.skins?.unlocked) &&
        data.skins.unlocked.length > 0
          ? data.skins.unlocked
          : defaults.skins.unlocked,

      equipped:
        typeof data.skins?.equipped === "string"
          ? data.skins.equipped
          : defaults.skins.equipped
    },

    daily: {
      day:
        typeof data.daily?.day === "string"
          ? data.daily.day
          : defaults.daily.day,

      streak:
        Number.isFinite(data.daily?.streak)
          ? Math.max(0, data.daily.streak)
          : defaults.daily.streak,

      missions:
        Array.isArray(data.daily?.missions)
          ? data.daily.missions
          : defaults.daily.missions,

      claimed:
        data.daily?.claimed === true
    },

    up: {
      speed:
        Number.isFinite(data.up?.speed)
          ? Math.max(0, data.up.speed)
          : defaults.up.speed,

      maxHp:
        Number.isFinite(data.up?.maxHp)
          ? Math.max(1, data.up.maxHp)
          : defaults.up.maxHp,

      empCd:
        Number.isFinite(data.up?.empCd)
          ? Math.max(0, data.up.empCd)
          : defaults.up.empCd,

      empRadius:
        Number.isFinite(data.up?.empRadius)
          ? Math.max(0, data.up.empRadius)
          : defaults.up.empRadius,

      magnet:
        Number.isFinite(data.up?.magnet)
          ? Math.max(0, data.up.magnet)
          : defaults.up.magnet
    },

    achievements:
      data.achievements &&
      typeof data.achievements === "object" &&
      !Array.isArray(data.achievements)
        ? data.achievements
        : defaults.achievements
  };
}

// ========================================
// Persistent Save Key
// ========================================

const PKEY = "gema_prime_full_v1";

const SECRET =
  "gema|" +
  navigator.userAgent.slice(0, 24) +
  "|prime";


// ========================================
// Persistent Game Data
// ========================================

const persistent = normalizeSave(
  STORE.get(
    PKEY,
    createDefaultSave(),
    SECRET
  )
);

  {
    shards: 0,
    best: 0,

    skins: {
      unlocked: ["neo"],
      equipped: "neo"
    },

    daily: {
      day: "",
      streak: 0,
      missions: [],
      claimed: false
    },

    up: {
      speed: 4.0,
      maxHp: 100,
      empCd: 9500,
      empRadius: 220,
      magnet: 0
    },

    achievements: {}
  },
  SECRET
);
