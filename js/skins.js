// ========================================
// GEMA PRIME
// Skin / Cosmetics System
// ========================================

const skinDefs = {
  neo: {
    name: "Neo",
    core: "rgba(0,246,255,1)",
    glow: "rgba(0,246,255,.65)",
    price: 0
  },

  ember: {
    name: "Ember",
    core: "rgba(255,208,86,1)",
    glow: "rgba(255,208,86,.55)",
    price: 350
  },

  void: {
    name: "Void",
    core: "rgba(190,120,255,1)",
    glow: "rgba(190,120,255,.55)",
    price: 750
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

// ---------------------------
// Skin unlock check
// ---------------------------

function isSkinUnlocked(id) {
  return Boolean(
    persistent.skins &&
    Array.isArray(
      persistent.skins.unlocked
    ) &&
    persistent.skins.unlocked.includes(id)
  );
}

// ---------------------------
// Skin purchase
// ---------------------------

function buySkin(id) {
  const skin =
    skinDefs[id];

  if (!skin) {
    return false;
  }

  if (isSkinUnlocked(id)) {
    return true;
  }

  const price =
    Number(skin.price) || 0;

  if (
    persistent.shards <
    price
  ) {
    toast(
      "Shards tidak cukup."
    );

    return false;
  }

  persistent.shards -=
    price;

  if (
    !Array.isArray(
      persistent.skins.unlocked
    )
  ) {
    persistent.skins.unlocked = [
      "neo"
    ];
  }

  persistent.skins.unlocked.push(
    id
  );

  STORE.set(
    PKEY,
    persistent,
    SECRET
  );

  toast(
    `${skin.name} unlocked!`
  );

  sfx({
    f: 760,
    t: "triangle",
    d: 0.14,
    v: 0.07,
    bend: 180
  });

  HAPTICS.pattern(
    "upgrade"
  );

  updateUI();

  return true;
}

// ---------------------------
// Equip skin
// ---------------------------

function equipSkin(id) {
  const skin =
    skinDefs[id];

  if (!skin) {
    return false;
  }

  if (!isSkinUnlocked(id)) {
    return false;
  }

  persistent.skins.equipped =
    id;

  STORE.set(
    PKEY,
    persistent,
    SECRET
  );

  toast(
    `${skin.name} equipped`
  );

  sfx({
    f: 640,
    t: "sine",
    d: 0.12,
    v: 0.06,
    bend: 100
  });

  updateUI();

  return true;
}

// ---------------------------
// Skin Shop UI
// ---------------------------

function renderSkinShop(ui) {
  if (!ui) {
    return;
  }

  if (!ui.skinGrid) {
    return;
  }

  ui.skinGrid.innerHTML =
    Object.entries(
      skinDefs
    ).map(
      ([id, skin]) => {

        const unlocked =
          isSkinUnlocked(id);

        const equipped =
          persistent.skins?.equipped === id;

        const price =
          Number(skin.price) || 0;

        let action;

        if (equipped) {
          action =
            `<button class="btn" disabled>EQUIPPED</button>`;
        } else if (unlocked) {
          action =
            `<button class="btn primary" data-skin-equip="${id}">EQUIP</button>`;
        } else {
          action =
            `<button class="btn primary" data-skin-buy="${id}">BUY ${price}</button>`;
        }

        return `
          <div class="skinCard">

            <div class="skinPreview"
                 style="
                   --skin-core:${skin.core};
                   --skin-glow:${skin.glow};
                 ">
              <div class="skinPreviewCore"></div>
            </div>

            <div class="skinName">
              ${skin.name}
            </div>

            <div class="skinStatus">
              ${
                equipped
                  ? "EQUIPPED"
                  : unlocked
                    ? "UNLOCKED"
                    : `${price} SHARDS`
              }
            </div>

            ${action}

          </div>
        `;
      }
    ).join("");

  if (ui.skinShards) {
    ui.skinShards.textContent =
      String(
        persistent.shards | 0
      );
  }
}

// ---------------------------
// Initialize Skin Shop
// ---------------------------

function initSkinShop(
  ui,
  helpers
) {
  if (!ui || !helpers) {
    return;
  }

  if (!ui.skinGrid) {
    return;
  }

  ui.skinGrid.addEventListener(
    "click",
    (e) => {

      const buyBtn =
        e.target.closest(
          "[data-skin-buy]"
        );

      if (buyBtn) {
        buySkin(
          buyBtn.dataset.skinBuy
        );

        renderSkinShop(ui);
        return;
      }

      const equipBtn =
        e.target.closest(
          "[data-skin-equip]"
        );

      if (equipBtn) {
        equipSkin(
          equipBtn.dataset.skinEquip
        );

        renderSkinShop(ui);
      }
    }
  );
}
