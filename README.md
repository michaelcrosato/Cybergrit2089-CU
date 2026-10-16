# Cybergrit 2089-CU

**Ghost Dividend** — an original isometric cyberpunk action RPG, built on **my-3D2dge v0.46.1**.

One district. A thousand stolen lives. Your call.

Play as Vex, a freelance runner hired to steal Helix's memory archive. Meet your fixer beneath the noodle-bar lights, cut the security relay, enter the compound, and decide whether to broadcast, sell, or erase 3,041 stolen lives. Reach the extraction car to finish the contract.

The complete Lowlight level includes a street clinic, three cyberware implants, a hidden supply cache, an optional prisoner rescue, a service passage, readable environmental fiction, five patrolling guards, a Warden encounter, two weapons, three quickhacks, three endings, and persistent checkpoints. A rescued technician can override the archive without killing the Warden. Clean-hands and ghost runs are supported.

## Play locally

Requires Node 22 or later. Runtime code has no external dependencies, assets, fonts, analytics, or API calls. Serve it over HTTP; ES modules cannot be opened reliably with `file://`.

```bash
npm ci
npm run dev
# http://localhost:5173
# If that port is busy:
PORT=5189 npm run dev
```

`npm run build` creates `dist/`, ready for any static host. The GitHub Actions workflow checks the simulation and browser controls, then publishes the exact build through GitHub Pages.

## Controller first

The standard Gamepad API mapping supports PS5/DualSense-compatible controllers. All menus have stick/D-pad focus navigation and Cross/Circle confirm/back. The engine provides rebinding, controller dead zones, glyph selection, vibration, fullscreen, sound, comfort settings, and automatic pause on focus loss or controller disconnection.

| Action | PS5-compatible controller | Keyboard / mouse |
|---|---|---|
| Move | Left stick | WASD / arrows |
| Aim | Right stick | Mouse |
| Fire | R2 | J / left mouse |
| Precision movement | L2 | K / right mouse |
| Interact / sustained terminal breach | Cross | E |
| Confirm / back in menus | Cross / Circle | Enter / Escape |
| Dash | Circle | Space / Shift |
| Reload | Square | R |
| Switch weapon | Triangle | Q |
| Open neural deck | L1 | Tab |
| Quick Short circuit | R1 | F |
| Crouch | L3 | C |
| Trauma patch | R3 | H / 1 |
| District map | Touchpad button | M |
| Pause | Options | Escape / P |

Fire without aiming to snap to a visible hostile. Aim with the right stick to select targets by direction. Crouch behind cover, approach an unaware guard from behind, or stun one; Cross performs a nonlethal neural takedown when close. Short circuit bypasses and strips armor. RAM regenerates. Enemy orange ground rings telegraph an imminent Warden pulse: dash outside the ring.

The title and HUD are designed for a television. Mobile is a spectator surface with no virtual sticks or gameplay buttons; touch/mobile UI is deliberately minimal. An FPS and frame-time readout is always present on desktop.

## Autonomous attract mode

Ten seconds without input on the title **or a title submenu** starts the live demo. It repeatedly completes the real level using the same collision, combat, hacking, inventory, dialogue and quest APIs as a player. The director alternates an assault, a clean nonlethal infiltration, and a scattergun run, rotating through all three endings. Finishes and failures restart automatically after four seconds.

Keyboard, pointer movement, pointer press, wheel, touch, or an active gamepad immediately returns to the title. The interrupt is consumed so it cannot also launch a new game. Demo runs never write a player checkpoint or personal record. Telemetry and effect buffers are bounded for kiosk use.

## Checks and handoff

```bash
npm test                         # deterministic gameplay and persistence checks
npm run build                    # self-contained static distribution
npm run test:browser             # controller, complete attract runs, 1080p frame budget, WebKit + Firefox
node tests/browser.mjs --smoke    # shorter controller / cross-browser checks for CI
viewport-matrix http://localhost:5189 -o /tmp/cybergrit-viewports
```

The full browser suite expects a running server at `http://localhost:5189`; set `TEST_URL` to override it. `QA_DIR` defaults to `/tmp/cybergrit-browser`. Browser binaries must match Playwright 1.63. On this WSL2/Ubuntu 26.04 machine the browsers and libraries were already installed; no `playwright install-deps` is needed.

When a display is available, the full suite measures WebKit in a normal window; its Linux headless software compositor is substantially slower. Smoke and viewport checks still use headless WebKit. A focused full check can be run with `node tests/browser.mjs --engine=webkit` or `--engine=firefox`.

- [Architecture and content expansion](docs/ARCHITECTURE.md)
- [Engine evaluation](docs/ENGINE-EVALUATION.md)
- [Acceptance evidence](docs/ACCEPTANCE.md)
- [50 candidates and random title draw](docs/TITLES.md)
- [Original task brief](docs/BRIEF.txt)
- [Bundled engine API](vendor/engine/API.md)

## Source information

This reference section is separate from the engine evaluation.

| Field | Confirmed information |
|---|---|
| Initial Date | **2026-10-16**, the first prompt in this workspace |
| SOURCE | **Cyberpunk 2077**. Inspiration for atmosphere, chrome, corporate power, narrative choice and systemic approaches. The story, characters, artwork and music here are original. |
| GAME ENGINE | **my-3D2dge v0.46.1**, vendored from commit `cfa866aa45474868350cad1a7fc015e612f9305f` |
| Engine handoff | <https://github.com/michaelcrosato/my-3d2dge/tree/main/dist/handoff> |
| Environment | Codex CLI workspace; Bash; Windows WSL2; Ubuntu 26.04.1 LTS; Node 22.23.3; Chromium, Firefox and WebKit. `nvidia-smi` reports an NVIDIA GeForce RTX 3060 Ti. |
| Model and Effort Level | OpenAI, GPT-6-based Codex. The exact model variant and reasoning effort are not exposed to the agent and are not guessed. |

The task was developed from model knowledge and the supplied engine repository without internet research. Direct engine retrieval, package installation, and GitHub publishing were infrastructure operations.

Engine copyright © 2026 Michael Crosato, MIT. See [engine license](vendor/engine/LICENSE). Original game code is also MIT licensed.
