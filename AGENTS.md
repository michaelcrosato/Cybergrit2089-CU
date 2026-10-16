# Cybergrit handoff

Read `README.md`, `docs/ARCHITECTURE.md`, and `docs/ACCEPTANCE.md` before changing gameplay. The original requested scope is retained in `docs/BRIEF.txt`.

- Preserve the controller-first isometric game. Keyboard and mouse feed the same action model. Do not introduce mobile sticks or mobile gameplay buttons.
- Reuse the pinned my-3D2dge engine. Its API card is `vendor/engine/API.md`. Game-specific extensions belong in `src/`; the current vendor file is unchanged from upstream.
- Runtime modules are native ESM and have no network dependencies. Import the engine before modules in Node tests.
- Put level coordinates, routes, encounters and prose in content data. Keep the fixed-step world independent of DOM presentation.
- Attract mode starts after ten seconds of title/menu inactivity. It must use gameplay actions, repeat indefinitely, exit on any input and never mutate a player save.
- Run the relevant simulation tests and browser flows after behavioral changes. Use the provided machine-wide viewport toolkit when changing UI. Store screenshots/reports under `/tmp`, outside the repository, and inspect them.
- `npm run dev` defaults to port 5173; this workspace has used `PORT=5189 npm run dev` because 5173 was occupied. Never terminate an unrelated server to free a port.
- Keep source/date/environment/model references accurate. Do not guess model variant or reasoning effort. Keep engine evaluation separate from source reference information.
- Update the acceptance record only with observed evidence, including test limitations. Physical DualSense feel and real iOS Safari have not been verified by automated tests.
