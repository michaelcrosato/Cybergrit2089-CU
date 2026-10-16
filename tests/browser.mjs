import { chromium, webkit, firefox } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const url = process.env.TEST_URL || "http://localhost:5189";
const out = process.env.QA_DIR || "/tmp/cybergrit-browser";
await mkdir(out, { recursive: true });
const report = {
  date: new Date().toISOString(),
  url,
  engines: [],
  controller: null,
  performance: null,
};
const onlyEngine = process.argv
  .find((a) => a.startsWith("--engine="))
  ?.split("=")[1];
const errors = [];
const saveReport = () =>
  writeFile(
    out + "/report.json",
    JSON.stringify({ ...report, errors }, null, 2),
  );
const captureErrors = (page) => {
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
};
const snap = (page) => page.evaluate(() => My3D2dge.current.debug.snapshot());
const press = async (page, button, ms = 90) => {
  await page.evaluate((i) => {
    window.testPad.buttons[i] = { pressed: true, touched: true, value: 1 };
  }, button);
  await page.waitForTimeout(ms);
  await page.evaluate((i) => {
    window.testPad.buttons[i] = { pressed: false, touched: false, value: 0 };
  }, button);
  await page.waitForTimeout(100);
};

// A standard-mapped DualSense is injected at the browser API boundary; real hardware still needs a human feel check.
if (!onlyEngine) {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });
  captureErrors(page);
  await page.addInitScript(() => {
    window.rumbles = [];
    window.testPad = {
      id: "DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)",
      index: 0,
      connected: true,
      mapping: "standard",
      timestamp: 0,
      axes: [0, 0, 0, 0],
      buttons: Array.from({ length: 18 }, () => ({
        pressed: false,
        touched: false,
        value: 0,
      })),
      vibrationActuator: {
        playEffect(type, data) {
          window.rumbles.push({ type, data });
          return Promise.resolve();
        },
        reset() {
          return Promise.resolve();
        },
      },
    };
    Object.defineProperty(navigator, "getGamepads", {
      value: () => [window.testPad],
    });
  });
  await page.goto(url);
  await page.waitForFunction(
    () => window.Cybergrit?.game.sceneName === "title",
  );
  await page.waitForTimeout(500);
  await press(page, 1);
  assert.equal(
    (await snap(page)).screen,
    "title",
    "back cannot dismiss the title",
  );
  await page.screenshot({ path: out + "/title-1920.png" });
  await press(page, 13);
  await press(page, 0);
  assert.equal((await snap(page)).screen, "help");
  await press(page, 1);
  assert.equal((await snap(page)).screen, "title");
  await press(page, 12);
  await press(page, 0);
  await page.waitForFunction(() => Cybergrit.game.sceneName === "play");
  const initial = (await snap(page)).player;
  await page.evaluate(() => (testPad.axes[0] = 0.85));
  await page.waitForTimeout(350);
  await page.evaluate(() => (testPad.axes[0] = 0));
  const moved = (await snap(page)).player;
  assert.ok(moved.x > initial.x && moved.y < initial.y);
  await page.evaluate(() => (testPad.axes[0] = -0.85));
  await page.waitForTimeout(350);
  await page.evaluate(() => (testPad.axes[0] = 0));
  await press(page, 0);
  assert.equal((await snap(page)).dialogue, "rook");
  await page.waitForTimeout(300);
  await page.screenshot({ path: out + "/dialogue-1920.png" });
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.waitForFunction(() => Cybergrit.world.dialogue === null);
  assert.equal((await snap(page)).screen, null);
  await press(page, 0);
  assert.equal((await snap(page)).dialogue, "rook");
  await press(page, 0);
  assert.equal((await snap(page)).stage, 1);
  await press(page, 9);
  assert.equal((await snap(page)).paused, true);
  const frozen = (await snap(page)).elapsed;
  await page.waitForTimeout(250);
  assert.equal((await snap(page)).elapsed, frozen);
  await press(page, 9);
  await press(page, 4);
  assert.equal((await snap(page)).screen, "deck");
  await page.screenshot({ path: out + "/deck-1920.png" });
  await press(page, 0);
  assert.ok((await snap(page)).player.cloak > 0);
  await press(page, 7, 300);
  assert.ok((await snap(page)).player.ammo < 12);
  assert.ok(await page.evaluate(() => rumbles.length > 0));
  await press(page, 2);
  await page.waitForTimeout(1200);
  assert.equal((await snap(page)).player.ammo, 12);
  await press(page, 3);
  assert.equal((await snap(page)).player.weapon, "scatter");
  await press(page, 10);
  assert.equal((await snap(page)).player.crouched, true);
  await press(page, 1);
  assert.ok((await snap(page)).stats.dashes > 0);
  await press(page, 17);
  assert.equal((await snap(page)).screen, "map");
  await page.screenshot({ path: out + "/map-1920.png" });
  await press(page, 1);
  await page.screenshot({ path: out + "/play-1920.png" });
  await page.evaluate(() => (testPad.connected = false));
  await page.waitForTimeout(200);
  assert.equal((await snap(page)).paused, true);
  await page.evaluate(() => (testPad.connected = true));
  await press(page, 9);
  // Checkpoint survives a full browser reload, then Continue actually loads its stage.
  await page.reload();
  await page.waitForFunction(
    () => window.Cybergrit?.game.sceneName === "title",
  );
  await press(page, 0);
  await page.waitForFunction(() => Cybergrit.game.sceneName === "play");
  assert.equal((await snap(page)).stage, 1);
  assert.deepEqual(await page.evaluate(() => My3D2dge.current.errors), []);
  report.controller = {
    passed: true,
    device: "standard-mapped simulated DualSense",
    checks: [
      "D-pad focus",
      "Cross confirm/interact",
      "Circle back/dash",
      "Options pause/resume",
      "L1 deck",
      "R2 fire",
      "Square reload",
      "Triangle switch",
      "L3 crouch",
      "Touchpad map",
      "disconnect pause",
      "checkpoint after reload",
    ],
  };
  await saveReport();
  await browser.close();
}

// Test idle entry from a submenu, multiple autonomous runs, keyboard/mouse/wheel/touch exits, save isolation, and frame budget.
if (!process.argv.includes("--smoke") && !onlyEngine) {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });
  captureErrors(page);
  await page.goto(url);
  await page.waitForFunction(() => window.Cybergrit);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.waitForFunction(
    () => Cybergrit.game.sceneName === "demo",
    {},
    { timeout: 16000 },
  );
  await page.waitForFunction(
    () => Cybergrit.demoRuns.length >= 3,
    {},
    { timeout: 180000 },
  );
  const data = await page.evaluate(() => ({
    runs: Cybergrit.demoRuns,
    samples: Cybergrit.perfSamples.filter((s) => s.scene === "demo"),
    errors: Cybergrit.game.errors,
    save: localStorage.getItem("cybergrit2089-cu:save"),
  }));
  assert.equal(data.save, null);
  assert.ok(data.runs.slice(0, 3).every((r) => r.finished));
  assert.deepEqual(
    data.runs.slice(0, 3).map((r) => r.ending),
    ["broadcast", "sell", "erase"],
  );
  assert.deepEqual(data.errors, []);
  const fps =
    data.samples.reduce((sum, s) => sum + s.fps, 0) / data.samples.length;
  report.performance = {
    viewport: "1920×1080",
    browser: "Chromium headless",
    samples: data.samples.length,
    averageFps: +fps.toFixed(1),
    minimumHalfSecondFps: Math.min(...data.samples.map((s) => s.fps)),
    averageRenderMs: +(
      data.samples.reduce((sum, s) => sum + s.renderMs, 0) / data.samples.length
    ).toFixed(2),
    runs: data.runs.slice(0, 3),
  };
  assert.ok(fps >= 25, `average frame rate ${fps} below 25`);
  await page.keyboard.press("KeyZ");
  await page.waitForFunction(() => Cybergrit.game.sceneName === "title");
  assert.equal((await snap(page)).screen, "title");
  for (const kind of ["pointer", "wheel", "touch", "release", "gamepad"]) {
    await page.evaluate(() => Cybergrit.startDemo());
    await page.waitForFunction(() => Cybergrit.game.sceneName === "demo");
    if (kind === "pointer") await page.mouse.move(550, 440);
    else if (kind === "wheel") await page.mouse.wheel(0, 100);
    else if (kind === "release") await page.keyboard.up("KeyZ");
    else if (kind === "touch")
      await page.evaluate(() =>
        window.dispatchEvent(
          new Event("touchstart", { bubbles: true, cancelable: true }),
        ),
      );
    else
      await page.evaluate(() => {
        const p = {
          id: "DualSense",
          index: 0,
          connected: true,
          axes: [0.8, 0, 0, 0],
          buttons: Array.from({ length: 18 }, () => ({
            pressed: false,
            value: 0,
          })),
        };
        Object.defineProperty(navigator, "getGamepads", {
          configurable: true,
          value: () => [p],
        });
      });
    await page.waitForFunction(() => Cybergrit.game.sceneName === "title");
    assert.equal((await snap(page)).screen, "title");
    if (kind === "gamepad")
      await page.evaluate(() =>
        Object.defineProperty(navigator, "getGamepads", { value: () => [] }),
      );
  }
  await saveReport();
  await browser.close();
}

for (const [name, type] of [
  ["webkit", webkit],
  ["firefox", firefox],
]) {
  if (onlyEngine && name !== onlyEngine) continue;
  // Functional input checks use an isolated headless window, unaffected by other
  // applications changing the shared desktop's focus.
  let headless = true;
  let browser = await type.launch({ headless });
  let page = await browser.newPage({
    viewport: { width: 1366, height: 768 },
  });
  captureErrors(page);
  await page.goto(url);
  await page.waitForFunction(
    () => window.Cybergrit?.game.sceneName === "title",
  );
  await page.waitForFunction(() => Cybergrit.game.r._frameNo > 2);
  await page.getByRole("button", { name: /^Enter Lowlight/ }).focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    () => Cybergrit.game.sceneName === "play" && !Cybergrit.game._fade,
  );
  await page.keyboard.press("KeyE");
  await page.waitForFunction(() => Cybergrit.world.dialogue === "rook");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => Cybergrit.world.stage === 1);
  await page.keyboard.down("KeyD");
  await page.waitForTimeout(250);
  await page.keyboard.up("KeyD");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => Cybergrit.game.paused);
  await page.waitForTimeout(350);
  await page.screenshot({ path: out + "/" + name + "-pause.png" });
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !Cybergrit.game.paused);
  await page.keyboard.press("Tab");
  await page.waitForFunction(() => Cybergrit.ui.screen === "deck");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => Cybergrit.ui.screen === null);
  await page.screenshot({ path: out + "/" + name + "-play.png" });
  assert.deepEqual(await page.evaluate(() => Cybergrit.game.errors), []);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  assert.equal(overflow, false);
  let performance = null;
  if (!process.argv.includes("--smoke")) {
    if (name === "webkit" && process.env.DISPLAY) {
      await browser.close();
      headless = false;
      browser = await type.launch({ headless });
      page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
      captureErrors(page);
      await page.goto(url);
      await page.waitForFunction(() => window.Cybergrit?.game.r?._frameNo > 2);
    }
    await page.evaluate(() => {
      Cybergrit.perfSamples.length = 0;
      Cybergrit.startDemo();
    });
    await page.waitForFunction(
      () => Cybergrit.demoRuns.length >= 1,
      {},
      { timeout: 90000 },
    );
    const samples = await page.evaluate(() =>
      Cybergrit.perfSamples.filter((s) => s.scene === "demo"),
    );
    const average = samples.reduce((sum, s) => sum + s.fps, 0) / samples.length;
    performance = {
      averageFps: +average.toFixed(1),
      samples: samples.length,
      minimumHalfSecondFps: Math.min(...samples.map((s) => s.fps)),
    };
    assert.ok(average >= 25, `${name} average FPS ${average} below 25`);
    assert.equal(
      await page.evaluate(() => Cybergrit.demoRuns[0].finished),
      true,
    );
  }
  report.engines.push({
    name,
    mode: headless ? "headless" : "windowed",
    passed: true,
    viewport: "1366×768",
    performance,
  });
  await saveReport();
  await browser.close();
}
report.errors = errors;
await writeFile(out + "/report.json", JSON.stringify(report, null, 2));
assert.deepEqual(errors, []);
console.log(JSON.stringify(report, null, 2));
