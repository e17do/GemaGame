// ========================================
// GEMA PRIME
// Skin / Cosmetics System
// ========================================

// ---------------------------
// Skin definitions
// ---------------------------

const skinDefs = {
  neo: {
    name: "Neo",
    core: "rgba(0,246,255,1)",
    glow: "rgba(0,246,255,.65)"
  },

  ember: {
    name: "Ember",
    core: "rgba(255,208,86,1)",
    glow: "rgba(255,208,86,.55)"
  },

  void: {
    name: "Void",
    core: "rgba(190,120,255,1)",
    glow: "rgba(190,120,255,.55)"
  }
};

// ---------------------------
// Current equipped skin
// ---------------------------

function currentSkin() {
  const id =
    persistent.skins?.equipped ||
    "neo";

  return (
    skinDefs[id] ||
    skinDefs.neo
  );
}
