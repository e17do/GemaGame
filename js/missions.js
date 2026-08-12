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
// Mission text
// ---------------------------

function updateMissionText() {
  if (!mission) return;

  switch (mission.type) {
    case "pellets":
      mission.text =
        `Collect ${mission.goal} pellets.`;
      break;

    case "time":
      mission.text =
        `Survive ${Math.floor(mission.goal / 1000)} seconds.`;
      break;

    case "pings":
      mission.text =
        `Use radar ping ${mission.goal} times.`;
      break;

    case "nohitPellets":
      mission.text =
        `Collect ${mission.goal} pellets without taking a hit.`;
      break;

    case "emps":
      mission.text =
        `Detonate EMP ${mission.goal} times.`;
      break;
  }
}

// ---------------------------
// Mission UI
// ---------------------------

function updateMissionUI() {
  if (!mission) return;

  if (mission.completed) {
    el.msText.textContent =
      `✓ ${mission.text} — COMPLETE`;

    el.msA.textContent =
      mission.type === "time"
        ? Math.floor(mission.goal / 1000)
        : mission.goal;

    el.msB.textContent =
      mission.type === "time"
        ? Math.floor(mission.goal / 1000)
        : mission.goal;

    el.msFill.style.width = "100%";

    return;
  }

  el.msText.textContent =
    mission.text;

  el.msA.textContent =
    mission.type === "time"
      ? Math.floor(mission.cur / 1000)
      : mission.cur;

  el.msB.textContent =
    mission.type === "time"
      ? Math.floor(mission.goal / 1000)
      : mission.goal;

  el.msFill.style.width =
    (
      clamp(
        mission.cur / mission.goal,
        0,
        1
      ) * 100
    ).toFixed(1) + "%";
}

// ---------------------------
// Mission difficulty scaling
// ---------------------------

function applyMissionScaling() {
  if (!mission) return;

  const level =
    Math.max(
      1,
      Math.floor(run?.level || 1)
    );

  const tier =
    Math.floor((level - 1) / 4);

  switch (mission.type) {
    case "pellets":
      mission.goal =
        5 + tier * 5;

      mission.reward =
        45 + tier * 15;
      break;

    case "time":
      mission.goal =
        (20 + tier * 10) * 1000;

      mission.reward =
        60 + tier * 20;
      break;

    case "pings":
      mission.goal =
        6 + tier * 3;

      mission.reward =
        40 + tier * 15;
      break;

    case "nohitPellets":
      mission.goal =
        10 + tier * 5;

      mission.reward =
        80 + tier * 25;
      break;

    case "emps":
      mission.goal =
        2 + tier;

      mission.reward =
        55 + tier * 20;
      break;
  }

  mission.cur = 0;
  mission.completed = false;

  updateMissionText();
}

// ---------------------------
// New mission
// ---------------------------

function newMission() {
  if (!mission) {
    mission =
      missionPool[
        Math.floor(
          Math.random() * missionPool.length
        )
      ]();

    applyMissionScaling();
    updateMissionUI();

    return;
  }

  const previousId =
    mission.id;

  let next;

  do {
    next =
      missionPool[
        Math.floor(
          Math.random() * missionPool.length
        )
      ]();
  } while (
    missionPool.length > 1 &&
    next.id === previousId
  );

  mission = next;

  applyMissionScaling();

  updateMissionUI();

  toast(
    "NEW MISSION: " +
    mission.text
  );

  sfx({
    f: 620,
    t: "sine",
    d: 0.09,
    v: 0.045,
    bend: 100
  });
}

// ---------------------------
// Complete mission
// ---------------------------

function completeMission() {
  if (!mission) return;

  if (mission.cur < mission.goal) {
    return;
  }

  if (mission.completed) {
    return;
  }

  mission.completed = true;

  // ---------------------------
  // Reward
  // ---------------------------

  persistent.shards +=
    mission.reward;

  STORE.set(
    PKEY,
    persistent,
    SECRET
  );

  updateMissionUI();

  toast(
    `MISSION COMPLETE! +${mission.reward} SHARDS`
  );

  addFloating(
    `+${mission.reward} SHARDS`,
    player.x,
    player.y - 48,
    "#FFD056"
  );

  burst(
    player.x,
    player.y,
    "#FFD056",
    18,
    0.7
  );

  camShake(2.5);

  sfx({
    f: 920,
    t: "triangle",
    d: 0.14,
    v: 0.065,
    bend: 180
  });

  HAPTICS.pattern("upgrade");

  updateUI();

  // --------------------------------
  // Automatically rotate mission
  // after a short celebration
  // --------------------------------

  setTimeout(() => {
    if (!mission) {
      return;
    }

    if (!mission.completed) {
      return;
    }

    newMission();
  }, 1800);
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
  const today =
    todayKey();

  const d =
    persistent.daily || {
      day: "",
      streak: 0,
      missions: [],
      claimed: false
    };

  if (d.day !== today) {
    const prev =
      d.day
        ? new Date(d.day)
        : null;

    const now =
      new Date(today);

    const diffDays =
      prev
        ? Math.round(
            (now - prev) /
            (1000 * 60 * 60 * 24)
          )
        : 999;

    if (diffDays === 1) {
      d.streak =
        (d.streak || 0) + 1;
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
  const d =
    persistent.daily;

  if (!d?.missions?.length) {
    el.dailyHint.textContent =
      "Daily: —";

    return;
  }

  const parts =
    d.missions.map(
      m => `${m.cur}/${m.goal}`
    );

  el.dailyHint.textContent =
    `Daily (streak ${d.streak}): ${parts.join(" · ")}`;
}

// ---------------------------
// Daily mission progress
// ---------------------------

function dailyProgress(
  type,
  amount = 1
) {
  const d =
    persistent.daily;

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

    m.cur =
      clamp(
        m.cur + amount,
        0,
        m.goal
      );

    any = true;

    if (m.cur >= m.goal) {
      persistent.shards +=
        m.reward;

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

    updateUI();
  }
}

// ---------------------------
// Mission time update
// ---------------------------

function updateMissionProgress(dt) {
  if (!mission) {
    return;
  }

  if (mission.completed) {
    return;
  }

  if (mission.type !== "time") {
    return;
  }

  mission.cur += dt;

  mission.cur =
    Math.min(
      mission.cur,
      mission.goal
    );

  updateMissionUI();

  if (mission.cur >= mission.goal) {
    completeMission();
  }
}
