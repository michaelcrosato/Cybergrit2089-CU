# Engine evaluation

This document evaluates the implementation foundation. Source-game, environment, date and model reference information is in the separate **Source information** section of the root README and in the HTML source/about screen.

## What the supplied engine carries

The full v0.46.1 handoff runs without runtime packages. Its fixed-step simulation and headless mode made it possible to run entire AI-controlled contracts deterministically. Isometric projection, Body collision, Bullets, height-aware TileMap queries, Suspicion, FlowField, Humanoid rigs, particles, sound synthesis, and the HTML Shell all serve actual gameplay.

The standard Shell remains responsible for pause, settings, control rebinding, D-pad/stick focus, button labels, fullscreen and lifecycle pausing. Its markup is themed for a television rather than replaced. This preserves the input and accessibility behavior supplied by the engine.

The renderer is well suited to this original pixel-art direction: floor material callbacks, projected primitives, depth ordering, shape/material registries and animated 3D rigs compose the level. Every prop and facade is authored in code. The engine's chip synthesizer plays a new dark electronic loop and contextual effects.

## Extensions made for this game

1. **Rotated shape visibility.** Base TileMap ray traversal only considers tile heights, although shape solids participate in Body collision and bullet height checks. `DistrictMap.ray` adds segment/rotated-box intersections, so large props also occlude sight.
2. **Shape-aware navigation.** Base FlowField samples cell heights. `DistrictNavigation` also samples registered solid shapes so AI avoids vending machines, parked cars and market counters.
3. **Data registry and heist state.** Content definitions, objective roles, inventory, implants, conditional access, quest choices and checkpoint schema form the game-specific layer above the engine.
4. **Kiosk lifecycle.** Idle detection includes title submenus and all active input devices. A real input adapter runs complete alternate approaches. Demo saves are isolated from player saves, and histories are bounded.
5. **Occlusion cutaways.** Foreground buildings fade when they obscure the runner; the engine's X-ray fallback remains available for overlaps. Navigation and collision stay solid.
6. **Static facade stamps.** Repeated facade windows, conduits, roof units and signage are rasterized once for a camera configuration, then drawn unscaled through the engine depth queue. This substantially reduces frame cost without changing the pixel grid.
7. **Selective character compositing.** Ordinary HD rigs use the engine's direct draw path. Chromium/Firefox retain composite hit flashes, cloak transparency and X-ray when a prop actually covers the runner. WebKit draws cloak transparency directly and uses an overhead marker for occlusion; damage still has rig reactions, particles, sound, camera response and rumble. This avoids its expensive cross-canvas tint operations without changing gameplay or the HD rigs.
8. **Bounded HUD layers.** HUD pieces occupy individual small compositor layers. WebKit uses opaque panels without blurred shadows; the translucent full-screen vignette is removed. HUD data refreshes independently of the fixed-step simulation. Final measured rates are recorded in the acceptance report.

The vendored upstream file remains byte-for-byte identical to the pinned commit. Extensions are independently reviewable modules; upgrading the engine does not require merging a monolithic patched engine.

## Practical limits

The renderer is Canvas-based, so CPU raster work and browser compositing matter more than the GPU model alone. A machine GPU report is not evidence that a headless browser is using that GPU; the acceptance report distinguishes the hardware from measured browser performance. Facade caching, visibility culling, bounded projectiles, HUD throttling, and a modest internal pixel resolution keep the tested desktop workload above the requested average frame budget.

Long shape footprints still sort as one object. Foreground cutaways and X-ray reduce occlusion ambiguity, but a future level with overlapping bridges should add explicit vertical layers rather than assume one ground-plane sort is sufficient. This level intentionally proves a ground-plane heist rather than a multi-storey traversal game.

The game supports the standard-mapped DualSense control model. Automated tests inject the Gamepad API; physical-controller feel and real iOS Safari are not claimed. WebKit is the available Safari-engine check. No downloaded source-game art, music, characters or story are included.
