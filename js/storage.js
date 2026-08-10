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

const persistent = STORE.get(
  PKEY,
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
