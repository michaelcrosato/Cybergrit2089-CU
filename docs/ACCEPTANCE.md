# Acceptance record

Audit date: 2026-10-16. This records observed results against the original `BRIEF.txt`, rather than redefining the brief around the implementation.

## Requirement coverage

| Requirement | Implementation and authoritative check |
|---|---|
| 50 playful titles, random selection, two-character alphanumeric suffix | `docs/TITLES.md` and `src/identity.json`: 50 distinct candidates; Python `secrets.randbelow` selected Cybergrit 2089; suffix CU. Repository name `Cybergrit2089-CU`. |
| Initialize git and create the requested public GitHub repository | `origin` points to `michaelcrosato/Cybergrit2089-CU`; GitHub API reports `PUBLIC`. Final publishing status is recorded below. |
| Use the supplied engine as the foundation | Full my-3D2dge v0.46.1 drives runtime, graphics, characters, physics, input, menus, audio and testing. Byte comparison against the supplied repository succeeded. SHA-256: `41b0ea21462c04d6642683c2c874a4b27094e5fcdbaff56b62a56574419f185d`. |
| Model knowledge only, no internet search | No internet research was performed. Network access was used for the specified engine, npm installation, GitHub repository operations and deployment. |
| Original source-inspired game, required isometric perspective | Lowlight, Vex, Rook, Iris, Sable, Helix and the Mnemosyne contract are original. The only playable camera mode is the engine's isometric projection. |
| One complete level with a beginning, meaningful approaches and ending | Contract → relay → Warden/peaceful override → archive choice → extraction → results → replay. Complete assault, clean nonlethal and scattergun runs finish in simulation and browser tests. |
| A foundation extensible by adding content | Level/content registry, reusable mission verbs, enemy archetypes, entity state, item definitions, event bus and save boundary. An independently registered test variant relocates gates, adds a seventh patrol and completes without changing simulation code. |
| Systemic proving ground | Movement/collision; solid prop sight/navigation; patrol/detection/search; low cover and crouch; targeted gunfire, reload and two weapons; dash/invulnerability; three RAM hacks; nonlethal takedowns; boss telegraph; damage/heal/death/retry; loot/currency/three implants; dialogue/rescue/conditional gates; three consequences; save/load/records. Covered by 17 deterministic tests. |
| Autonomous attract mode after ten idle seconds | Title and title submenus use a monotonic wall clock. A measured Settings → demo transition took 10,083 ms including browser polling. Headless tests check the exact simulation threshold and inactivity reset. |
| Continuous AI loop until any player input | The director drives actual gameplay APIs and alternates three complete approaches/endings. It restarts after success/failure, consumes the interrupt, and returns to the title. Keyboard, pointer motion, wheel, touch and gamepad exits are exercised in the browser suite. |
| Demo save isolation and kiosk longevity | Checkpoint/record writes are excluded for demo worlds. A sentinel player checkpoint remains byte-for-byte unchanged during repeated runs. Event, frame, demo history and projectile buffers are bounded. |
| PS5-compatible controller as primary input | Standard Gamepad API, DualSense symbols, D-pad/stick focus, Cross/Circle menus, triggers, bumpers, L3/R3, Options, touchpad with Create fallback, and rumble. Browser tests inject a standard-mapped DualSense at the API boundary and exercise actions plus disconnection/reconnection. |
| Keyboard/mouse use the same model | One action map and one World input contract. Keyboard/mouse are alternate bindings, including directional aiming and focus navigation. |
| Readable television UI; restrained mobile UI | Large modal choices and contextual prompts; sparse anchored HUD; no inventory table/dashboard layout. Coarse-pointer devices show the world without virtual sticks or gameplay HUD. Viewport inspection is recorded below. |
| Atmosphere, animation, frame readout and ≥25 average FPS | Original procedural neon architecture, dressed HD rigs, animated patrol/combat/death poses, rain/reflections, electronic soundtrack, effects, rumble and live FPS/frame-time display. Browser performance results are recorded below; full gameplay remains fixed-step. |
| Source information in chat, README and HTML, separate from engine evaluation | Root README reference table; `index.html` source-information block; in-game Credits & source; final handoff message. Engine evaluation is its own document. |

## Checks

- `npm run check`: **17 tests passed**, zero failures, static build succeeded.
- `npm run test:browser`: **passed**. Standard-mapped simulated DualSense controls, rumble calls, title focus, dialogue close, pause/resume, reload/switch, touchpad map, disconnection, save reload, all interruption devices (including release), and three complete autonomous endings. Zero page/console errors. Final report: `/tmp/cybergrit-browser/report.json`.
- `viewport-matrix http://localhost:5189 -o /tmp/cybergrit-viewports --dpr1`: **24 clean captures across 14 device/viewport profiles**, including WebKit phones/tablets and all three engines on desktop/ultrawide. No overflow, JS errors, console errors, HTTP failures or failed requests. All contact-sheet images were inspected; representative original PNGs and gameplay/dialogue/result screens were also inspected. Files: `/tmp/cybergrit-viewports/` and `/tmp/cybergrit-scenes/`.
- Publication: **public and deployed**. Source release commit `48853752cc2b4e1f5a272db61816ac93d06b6041`. [GitHub verification and deployment run](https://github.com/michaelcrosato/Cybergrit2089-CU/actions/runs/38966115794) completed successfully, including fresh install, all 17 systems tests, build, Chromium/controller checks, headless WebKit/Firefox checks, and Pages deployment. [Public game](https://michaelcrosato.github.io/Cybergrit2089-CU/) returns HTTP 200; hosted HTML, main module and engine bytes match the local source. A fresh public-URL browser session entered the level, spoke to Rook and advanced to the relay objective with zero errors.

## Measured desktop performance

| Browser / presentation | Viewport | Samples | Average FPS | Lowest half-second sample |
|---|---|---:|---:|---:|
| Chromium, headless | 1920×1080 | 216 | **59.6** | 48 |
| Webkit, windowed | 1366×768 | 60 | **57.4** | 26 |
| Firefox, headless | 1366×768 | 60 | **59.9** | 58 |

Each measured run completed the actual level. Chromium covered all three endings; the nonlethal run completed with zero shots, zero kills, zero detections and zero damage. These are samples of the engine’s measured frame rate, not fixed display values. The full browser suite exited successfully.

## Verification limits

The host reports an RTX 3060 Ti, but Canvas rendering and headless compositing are also CPU/browser dependent. Frame results identify the browser and viewport, and should not be read as a native Windows GPU benchmark. Averages do not imply that every individual frame meets 40 ms. Cold caches can produce brief dips. Linux headless WebKit’s software compositor measured roughly 20–26 FPS in separate diagnostic runs; the desktop performance gate therefore uses normal windowed WebKit on this display-capable target host. Headless WebKit still passes functional and viewport checks. This distinction is explicit in the browser harness and results.

Controller behavior is tested through the standard browser API, including vibration calls. Physical DualSense feel has not been tested. WebKit is a Safari-engine compatibility check; real iOS Safari is unavailable here. Mobile is intentionally a spectator display and has no touch gameplay controls.

Screenshots and machine-readable QA reports remain under `/tmp`, outside the repository, as requested. CI retains its browser artifacts on the workflow run.
