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
- `npm run test:browser`: final run in progress at the time this record was drafted.
- `viewport-matrix`: final screenshot review pending at the time this record was drafted.
- Publication: public repository created; final commit, CI and hosted build verification pending at the time this record was drafted.

## Verification limits

The host reports an RTX 3060 Ti, but Canvas rendering and headless compositing are also CPU/browser dependent. Frame results identify the browser and viewport, and should not be read as a native Windows GPU benchmark. Averages do not imply that every individual frame meets 40 ms. Cold caches can produce brief dips.

Controller behavior is tested through the standard browser API, including vibration calls. Physical DualSense feel has not been tested. WebKit is a Safari-engine compatibility check; real iOS Safari is unavailable here. Mobile is intentionally a spectator display and has no touch gameplay controls.

Screenshots and machine-readable QA reports remain under `/tmp`, outside the repository, as requested. CI retains its browser artifacts on the workflow run.
