// ========================================
// GEMA PRIME
// Mission System
// ========================================

// ---------------------------
// Mission definitions
// ---------------------------

const missionPool = [
  () => ({
    id: "pel5",
    text: "Collect 5 pellets.",
    goal: 5,
    cur: 0,
    reward: 45,
    type: "pellets"
  }),

  () => ({
    id: "survive20",
    text: "Survive 20 seconds.",
    goal: 20000,
    cur: 0,
    reward: 60,
    type: "time"
  }),

  () => ({
    id: "ping6",
    text: "Use radar ping 6 times.",
    goal: 6,
    cur: 0,
    reward: 40,
    type: "pings"
  }),

  () => ({
    id: "noHit10",
    text: "Collect 10 pellets without taking a hit.",
    goal: 10,
    cur: 0,
    reward: 80,
    type: "nohitPellets"
  }),

  () => ({
    id: "emp2",
    text: "Detonate EMP 2 times.",
    goal: 2,
    cur: 0,
    reward: 55,
    type: "emps"
  })
];

let mission = missionPool[0]();

// ---------------------------
// Mission UI
// ---------------------------

function updateMissionUI() {
  el.msText.textContent = mission.text;

  el.msA.textContent =
    mission.type === "time"
      ? Math.floor(mission.cur / 1000)
      : mission.cur;

  el.msB.textContent =
    mission.type === "time"
      ? Math.floor(mission.goal / 1000)
      : mission.goal;

  el.msFill.style.width =
    (clamp(mission.cur / mission.goal, 0, 1) * 100).toFixed(1) + "%";
}

// ---------------------------
// New mission
// ---------------------------

function newMission() {
  mission =
    missionPool[
      Math.floor(Math.random() * missionPool.length)
    ]();

  updateMissionUI();

  toast("New mission: " + mission.text);
}

// ---------------------------
// Complete mission
// ---------------------------

function completeMission() {
  persistent.shards += mission.reward;

  STORE.set(
    PKEY,
    persistent,
    SECRET
  );

  toast(
    `Mission complete +${mission.reward} shards`
  );

  sfx({
    f: 980,
    t: "triangle",
    d: 0.18,
    v: 0.08,
    bend: -240
  });

  sfx({
    f: 1460,
    t: "sine",
    d: 0.16,
    v: 0.06
  });

  HAPTICS.pattern("upgrade");

  newMission();
  updateUI();
}

// ---------------------------
// Daily mission
// ---------------------------

function todayKey() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

function resetDailyIfNeeded() {
  const today = todayKey();

  const d =
    persistent.daily || {
      day: "",
      streak: 0,
      missions: [],
      claimed: false
    };

  if (d.day !== today) {
    const prev = d.day
      ? new Date(d.day)
      : null;

    const now = new Date(today);

    const diffDays = prev
      ? Math.round(
          (now - prev) /
          (1000 * 60 * 60 * 24)
        )
      : 999;

    if (diffDays === 1) {
      d.streak = (d.streak || 0) + 1;
    } else {
      d.streak = 1;
    }

    d.day = today;
    d.claimed = false;

    d.missions = [
      {
        id: "d_pel20",
        text: "Daily: Collect 20 pellets",
        goal: 20,
        cur: 0,
        reward: 140,
        type: "pellets"
      },

      {
        id: "d_wave3",
        text: "Daily: Reach Wave 3",
        goal: 3,
        cur: 0,
        reward: 160,
        type: "wave"
      }
    ];

    persistent.daily = d;

    STORE.set(
      PKEY,
      persistent,
      SECRET
    );
  }
}

// ---------------------------
// Daily mission UI
// ---------------------------

function updateDailyHint() {
  const d = persistent.daily;

  if (!d?.missions?.length) {
    el.dailyHint.textContent = "Daily: —";
    return;
  }

  const parts = d.missions.map(
    m => `${m.cur}/${m.goal}`
  );

  el.dailyHint.textContent =
    `Daily (streak ${d.streak}): ${parts.join(" · ")}`;
}

// ---------------------------
// Daily mission progress
// ---------------------------

function dailyProgress(type, amount = 1) {
  const d = persistent.daily;

  if (!d?.missions) {
    return;
  }

  let any = false;

  for (const m of d.missions) {
    if (m.type !== type) {
      continue;
    }

    if (m.cur >= m.goal) {
      continue;
    }

    m.cur = clamp(
      m.cur + amount,
      0,
      m.goal
    );

    any = true;

    if (m.cur >= m.goal) {
      persistent.shards += m.reward;

      toast(
        `${m.text} complete +${m.reward} shards (streak ${d.streak})`
      );

      sfx({
        f: 820,
        t: "triangle",
        d: 0.14,
        v: 0.06,
        bend: 120
      });

      HAPTICS.pattern("ach");
    }
  }

  if (any) {
    STORE.set(
      PKEY,
      persistent,
      SECRET
    );

    updateDailyHint();
  }
}

// ---------------------------
// Mission time update
// ---------------------------

function updateMissionProgress(dt) {
  if (mission.type !== "time") {
    return;
  }

  mission.cur += dt;

  updateMissionUI();

  if (mission.cur >= mission.goal) {
    completeMission();
  }
}
