import test from "node:test";
import assert from "node:assert/strict";
import "../vendor/engine/my-3d2dge.js";
import { createApp } from "../src/main.js";
import { World, DemoDirector } from "../src/world.js";
import { SaveStore } from "../src/persistence.js";
import { DistrictMap, DistrictNavigation } from "../src/spatial.js";
import { ID, WEAPONS } from "../src/data.js";
import { LOWLIGHT, registerLevel } from "../src/level.js";
const E = globalThis.My3D2dge;
const memory = () => {
  const data = new Map();
  return {
    getItem: (k) => data.get(k) || null,
    setItem: (k, v) => data.set(k, v),
    removeItem: (k) => data.delete(k),
    data,
  };
};
const fresh = () => new World(new E.Game({ headless: true, loop: false }));
const run = (w, s, actions = {}) => {
  for (let n = 0; n < Math.round(s * 120); n++)
    w.update(1 / 120, typeof actions === "function" ? actions(n) : actions);
};
const at = (w, x, y) => Object.assign(w.player, { x, y, z: 0, vx: 0, vy: 0 });
const beside = (w, id) => {
  const o = w.interactables.find((o) => o.id === id);
  at(w, o.x, o.y + 23);
};

test("title idles for exactly ten seconds; fresh input resets it; demo returns to title immediately", () => {
  const app = createApp({ headless: true, storage: memory() });
  app.game.input.hold("dash");
  app.game.advance(12);
  assert.equal(app.game.sceneName, "title", "held input prevents idle entry");
  app.game.input.hold("dash", false);
  app.game.advance(9.9);
  assert.equal(app.game.sceneName, "title");
  app.noteActivity();
  app.game.advance(9.9);
  assert.equal(app.game.sceneName, "title");
  app.game.advance(0.2);
  assert.equal(app.game.sceneName, "demo");
  assert.equal(app.world.demo, true);
  assert.equal(app.noteActivity(), true);
  app.game.advance(1 / 120);
  assert.equal(app.game.sceneName, "title");
  assert.equal(app.ui.screen, "title");
  app.game.advance(1);
  assert.equal(app.game.sceneName, "title");
  assert.deepEqual(app.game.errors, []);
  app.game.dispose();
});

test("demo uses real mechanics, repeats all endings, includes a clean nonlethal run, and never writes a player save", () => {
  const storage = memory(),
    sentinel = "player checkpoint must stay byte-for-byte unchanged";
  storage.setItem(ID + ":save", sentinel);
  const app = createApp({ headless: true, storage });
  app.game.advance(250);
  assert.ok(app.demoRuns.length >= 6);
  assert.ok(app.demoRuns.every((r) => r.finished));
  assert.deepEqual(
    app.demoRuns.slice(0, 3).map((r) => r.ending),
    ["broadcast", "sell", "erase"],
  );
  assert.equal(app.demoRuns[1].kills, 0);
  assert.ok(app.demoRuns[1].nonlethal >= 3);
  assert.equal(app.demoRuns[1].shots, 0);
  const events = new Set(app.demoRuns.flatMap((r) => r.events));
  for (const event of [
    "dialogue",
    "relay",
    "core",
    "complete",
    "upgrade",
    "hack",
    "weapon",
    "takedown",
    "bossTelegraph",
    "reloaded",
    "rescue",
    "loot",
  ])
    assert.ok(events.has(event), event);
  assert.equal(storage.getItem(ID + ":save"), sentinel);
  assert.deepEqual(app.game.errors, []);
  app.game.dispose();
});

test("camera-relative keyboard movement and building collision use engine Body physics", () => {
  const app = createApp({ headless: true, storage: memory() });
  app.startRun();
  app.game.advance(0.3);
  const p = app.world.player,
    x = p.x,
    y = p.y;
  app.game.input.hold("right");
  app.game.advance(0.4);
  app.game.input.hold("right", false);
  assert.ok(
    p.x > x && p.y < y,
    "screen right travels northeast in the isometric ground plane",
  );
  at(app.world, 154, 470);
  run(app.world, 1, { move: [-1, 0] });
  assert.ok(p.x >= 133, "no walking through noodle-bar footprint");
  app.game.dispose();
});

test("solid prop collision, sight and navigation use compatible geometry", () => {
  const m = new DistrictMap({
    w: 10,
    h: 10,
    types: {},
    floorTex: () => [0, 0, 0],
  });
  m.solid("cg:server", 80, 80);
  assert.equal(
    m.ray(
      { x: 40, y: 80, z: 0 },
      { x: 120, y: 80, z: 0 },
      { eye: 20, target: 20 },
    ).clear,
    false,
  );
  assert.equal(
    m.ray(
      { x: 40, y: 80, z: 0 },
      { x: 120, y: 80, z: 0 },
      { eye: 50, target: 50 },
    ).clear,
    true,
  );
  const b = new E.Body({ x: 65, y: 80, r: 5 });
  b.vx = 40;
  b.update(0.5, m);
  assert.ok(b.x <= 65 || b.x >= 95);
  const nav = new DistrictNavigation(m);
  nav.update(120, 80);
  assert.equal(Number.isNaN(nav._top(4, 4)), true);
  const d = nav.dir(40, 80, 120, 80);
  assert.ok(d.every(Number.isFinite));
});

test("contract gating, sustained breach, interruption and gate topology", () => {
  const w = fresh();
  beside(w, "relay");
  assert.equal(w.interact("relay"), false);
  assert.equal(w.stage, 0);
  beside(w, "rook");
  assert.equal(w.interact("rook"), true);
  w.choose(1);
  assert.equal(w.stage, 1);
  assert.equal(w.player.maxRam, 7);
  beside(w, "relay");
  run(w, 0.5, { interactHeld: true });
  assert.ok(w.channel.progress > 0);
  run(w, 0.1, {});
  assert.equal(w.channel, null);
  assert.equal(w.stage, 1);
  run(w, 1.8, { interactHeld: true });
  assert.equal(w.stage, 2);
  assert.equal(w.flags.relay, true);
  assert.equal(w.map.cell(34, 20), 0);
  assert.equal(w.map.cell(34, 12), 4, "service passage remains gated");
});

test("vision acquires a visible runner, cloak breaks sight, memory wipe resets aggression", () => {
  const w = fresh(),
    e = w.enemies[0];
  e.route = [[320, 416]];
  e.x = 320;
  e.y = 416;
  e.facing = Math.PI / 2;
  at(w, 320, 468);
  run(w, 2);
  assert.equal(e.mind.state, "alert");
  assert.ok(w.stats.detections > 0);
  w.player.ram = 6;
  assert.equal(w.hack("wipe"), true);
  assert.equal(e.mind.state, "calm");
  assert.ok(e.blind > 0);
  w.player.ram = 6;
  assert.equal(w.hack("cloak"), true);
  run(w, 0.2);
  assert.equal(e.seen, false);
  assert.ok(w.player.cloak > 0);
  w.fire();
  assert.equal(w.player.cloak, 0);
});

test("gunfire consumes magazines, projectile impacts damage targets, reload conserves reserve", () => {
  const w = fresh(),
    e = w.enemies[0];
  e.x = 320;
  e.y = 448;
  e.route = [[320, 448]];
  e.stunned = 10;
  at(w, 320, 520);
  assert.equal(w.fire(-Math.PI / 2), true);
  run(w, 0.3);
  assert.ok(e.hp < e.maxHp);
  assert.equal(w.player.ammo.needle, 11);
  assert.ok(w.stats.hits > 0);
  w.player.ammo.needle = 0;
  const reserve = w.player.reserve;
  assert.equal(w.reload(), true);
  run(w, 1.2);
  assert.equal(w.player.ammo.needle, 12);
  assert.equal(w.player.reserve, reserve - 12);
  w.update(1 / 120, { weapon: true });
  assert.equal(
    w.player.weapon,
    "scatter",
    "weapon switching works after a completed reload",
  );
  w.player.fireCooldown = 0;
  w.fire(-Math.PI / 2);
  assert.equal(w.player.ammo.scatter, 5);
  assert.equal(w.shots.list.length, WEAPONS.scatter.pellets);
});

test("RAM costs, insufficient RAM, regeneration, nonlethal short circuits and takedowns", () => {
  const w = fresh(),
    e = w.enemies[0];
  at(w, 320, 470);
  e.x = 320;
  e.y = 440;
  e.route = [[320, 440]];
  w.player.ram = 1;
  assert.equal(w.hack("overload"), false);
  assert.equal(w.player.ram, 1);
  w.player.ram = 6;
  assert.equal(w.hack("overload"), true);
  assert.equal(w.player.ram, 4);
  assert.ok(e.stunned > 0);
  assert.equal(e.hp, 23);
  at(w, 320, 456);
  assert.equal(w.nearest().kind, "takedown");
  assert.equal(w.interact("takedown:g1"), true);
  assert.equal(e.dead, true);
  assert.equal(w.stats.kills, 0);
  assert.equal(w.stats.nonlethal, 1);
  const before = w.player.ram;
  run(w, 1);
  assert.ok(w.player.ram > before);
});

test("dash grants a finite evade window; damage, healing and death have complete loops", () => {
  const w = fresh();
  w.update(1 / 120, { dash: true, move: [1, 0] });
  const hp = w.player.hp;
  w.damage(30);
  assert.equal(w.player.hp, hp);
  run(w, 0.4);
  w.damage(40);
  assert.equal(w.player.hp, hp - 40);
  assert.ok(w.heal());
  assert.equal(w.player.meds, 2);
  assert.equal(w.player.hp, hp);
  w.player.invuln = 0;
  w.damage(1000);
  assert.equal(w.failed, true);
  assert.equal(w.player.hp, 0);
  const time = w.elapsed;
  run(w, 1);
  assert.equal(w.elapsed, time);
});

test("a committed Warden pulse resolves after sight is broken and can be evaded", () => {
  const w = fresh(),
    boss = w.enemies.find((e) => e.kind === "boss");
  boss.asleep = false;
  boss.windup = 0.5;
  boss.attackPoint = { x: 720, y: 328 };
  at(w, 176, 584);
  const hp = w.player.hp;
  run(w, 0.6);
  assert.ok(boss.windup <= 0);
  assert.ok(boss.fireCooldown > 0);
  assert.equal(w.player.hp, hp);
  assert.ok(w.effects.some((e) => e.type === "pulse"));
});

test("loot can be collected only once; implants charge once and persist their effect", () => {
  const w = fresh();
  beside(w, "cache");
  assert.ok(w.interact("cache"));
  const money = w.player.credits;
  assert.equal(w.interact("cache"), false);
  assert.equal(w.player.credits, money);
  assert.ok(w.purchase("dermal"));
  assert.equal(w.player.maxHp, 135);
  const after = w.player.credits;
  assert.equal(w.purchase("dermal"), false);
  assert.equal(w.player.credits, after);
  assert.equal(w.purchase("ram"), false);
  assert.deepEqual(w.player.upgrades, ["dermal"]);
});

test("rescue enables a nonlethal archive override, and each choice produces a distinct outcome", () => {
  for (let choice = 0; choice < 3; choice++) {
    const w = fresh();
    beside(w, "rook");
    w.interact("rook");
    w.choose(0);
    beside(w, "relay");
    w.interact("relay");
    beside(w, "core");
    assert.equal(w.interact("core"), false, "Warden locks the archive");
    beside(w, "captive");
    w.interact("captive");
    assert.ok(w.choose(0));
    assert.equal(w.map.cell(34, 12), 0);
    assert.equal(w.enemies.at(-1).armor, false);
    beside(w, "core");
    assert.ok(w.interact("core"));
    assert.equal(w.stage, 3);
    assert.ok(w.choose(choice));
    assert.equal(w.stage, 4);
    assert.equal(w.ending, ["broadcast", "sell", "erase"][choice]);
    if (choice === 0) assert.ok(w.enemies.every((e) => e.mind.level >= 1));
    if (choice === 2) assert.ok(w.enemies.every((e) => e.stunned === 8));
    beside(w, "exit");
    assert.ok(w.interact("exit"));
    assert.equal(w.finished, true);
    assert.equal(w.result().kills, 0);
  }
});

test("checkpoints round-trip full state and reject corrupt, incompatible or unsafe saved values", () => {
  const storage = memory(),
    s = new SaveStore(storage),
    w = fresh();
  beside(w, "rook");
  w.interact("rook");
  w.choose(1);
  beside(w, "relay");
  w.interact("relay");
  w.player.credits = 250;
  w.purchase("ram");
  w.hurtEnemy(w.enemies[0], 100, true);
  w.player.weapon = "scatter";
  w.player.ammo.scatter = 3;
  assert.ok(s.write(w.serialize()));
  const saved = s.read();
  assert.ok(saved);
  const restored = new World(w.game, { saved });
  assert.deepEqual(restored.serialize(), w.serialize());
  assert.equal(restored.map.cell(34, 20), 0);
  for (const corrupt of [
    "{",
    JSON.stringify({ ...saved, version: 999 }),
    JSON.stringify({ ...saved, player: { ...saved.player, hp: NaN } }),
    JSON.stringify({
      ...saved,
      player: { ...saved.player, weapon: "missing" },
    }),
    JSON.stringify({ ...saved, enemies: [] }),
  ]) {
    storage.setItem(ID + ":save", corrupt);
    assert.equal(s.read(), null);
  }
  const blocked = new SaveStore({
    getItem() {
      throw new Error("denied");
    },
    setItem() {
      throw new Error("denied");
    },
  });
  assert.equal(blocked.read(), null);
  assert.equal(blocked.write(w.serialize()), false);
});

test("retry loads the last checkpoint; play cannot be mutated while the engine pause menu is active", () => {
  const storage = memory(),
    app = createApp({ headless: true, storage });
  app.startRun();
  app.game.advance(0.3);
  beside(app.world, "rook");
  app.world.interact("rook");
  app.world.choose(0);
  app.ui.hide();
  app.game.pause("test");
  const before = app.world.elapsed;
  app.game.advance(3);
  assert.equal(app.world.elapsed, before);
  app.ui.hide();
  app.game.resume();
  app.world.player.invuln = 0;
  app.world.damage(1000);
  app.game.advance(0.3);
  assert.equal(app.game.sceneName, "dead");
  app.startRun(true);
  app.game.advance(0.3);
  assert.equal(app.game.sceneName, "play");
  assert.equal(app.world.stage, 1);
  assert.equal(app.world.failed, false);
  assert.ok(app.world.player.hp > 0);
  assert.deepEqual(app.game.errors, []);
  app.game.dispose();
});

test("fixed steps reproduce the same complete run across render batch sizes", () => {
  const simulate = (batch) => {
    const w = fresh(),
      bot = new DemoDirector(w);
    for (let n = 0; n < 60 * 120 && !w.finished; n += batch)
      for (let j = 0; j < batch && !w.finished; j++)
        w.update(1 / 120, bot.update(1 / 120));
    return w.serialize();
  };
  assert.deepEqual(simulate(1), simulate(7));
});

test("a registered content variant with relocated gates and an extra patrol completes without simulation changes", () => {
  const level = registerLevel({
    ...LOWLIGHT,
    id: "content-expansion-test",
    name: "EXPANSION PROVING GROUND",
    gates: {
      main: { ...LOWLIGHT.gates.main, y: 18 },
      service: { ...LOWLIGHT.gates.service, y: 9 },
    },
    objectives: LOWLIGHT.objectives.map((o) => ({
      ...o,
      title: "Expansion / " + o.title,
    })),
    enemies: [
      ...LOWLIGHT.enemies,
      {
        id: "transit-sentry",
        kind: "guard",
        x: 800,
        y: 480,
        route: [
          [800, 480],
          [832, 480],
        ],
        facing: Math.PI,
      },
    ],
  });
  const w = new World(new E.Game({ headless: true, loop: false }), { level }),
    bot = new DemoDirector(w);
  for (let i = 0; i < 100 * 120 && !w.finished; i++)
    w.update(1 / 120, bot.update(1 / 120));
  assert.equal(w.finished, true);
  assert.equal(w.enemies.length, 7);
  assert.equal(w.map.cell(34, 18), 0);
  // Save validation obtains the new level's bounds and actor IDs from the registry.
  const s = new SaveStore(memory());
  s.write(w.serialize());
  assert.equal(s.read().level, level.id);
});

test("player extraction opens results, stores a record, clears the checkpoint and supports a fresh replay", () => {
  const storage = memory(),
    app = createApp({ headless: true, storage });
  app.startRun();
  app.game.advance(0.3);
  const w = app.world;
  for (const [id, choice] of [
    ["rook", 1],
    ["captive", 0],
  ]) {
    beside(w, id);
    w.interact(id);
    w.choose(choice);
    app.ui.hide();
  }
  beside(w, "relay");
  w.interact("relay");
  beside(w, "core");
  w.interact("core");
  w.choose(2);
  app.ui.hide();
  assert.ok(storage.getItem(ID + ":save"));
  beside(w, "exit");
  w.interact("exit");
  app.game.advance(0.3);
  assert.equal(app.game.sceneName, "results");
  assert.equal(app.ui.screen, "results");
  assert.equal(storage.getItem(ID + ":save"), null);
  assert.equal(JSON.parse(storage.getItem(ID + ":record")).ending, "erase");
  app.startRun(false);
  app.game.advance(0.3);
  assert.equal(app.game.sceneName, "play");
  assert.equal(app.world.stage, 0);
  assert.equal(app.world.finished, false);
  app.game.dispose();
});
