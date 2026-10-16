# Architecture and expansion handoff

## Runtime boundary

The unmodified full my-3D2dge engine is pinned under `vendor/engine/`. It owns the fixed 120 Hz step, orthographic projection, depth queue, procedural Humanoid rigs, physics, particles, projectiles, synthesized audio, camera, input/device mapping, standard Shell menus, control rebinding, settings, and browser lifecycle. Original game modules build on those systems. There is no second renderer or parallel input framework.

| Module | Responsibility |
|---|---|
| `src/data.js` | Identity, default control map, weapon/hack/implant definitions, dialogue, endings, soundtrack |
| `src/level.js` | Level registry and geometry, spawn/route data, gates, encounters, objectives, NPC roles and dressing |
| `src/spatial.js` | DistrictMap shape-aware sight rays and DistrictNavigation shape-aware flow fields |
| `src/world.js` | Deterministic simulation, entity lifecycle, combat, perception, interaction channels, quest verbs, upgrades, loot, serialize/restore, demo AI |
| `src/assets.js` | Original procedural shape/material registrations and character palettes |
| `src/render.js` | Isometric city presentation, cached facade stamps, occlusion cutaways, rain, targets, telegraphs |
| `src/persistence.js` | Event bus and validated/versioned checkpoint boundary |
| `src/main.js` | Scene orchestration, Shell screens, contextual HUD, save hooks, idle service and input adapter |
| `style.css` | Television-scale typography, focused menu states, restrained HUD and spectator rules |

The simulation never queries DOM elements. Both a human input adapter and `DemoDirector` produce the same action object. Menus call the same `interact`, `choose`, `purchase`, and `hack` methods. Tests run this implementation without drawing.

## Update order and invariants

1. Fixed-step timers and resource regeneration.
2. Player intent, dash/aim/crouch state, Body collision.
3. Fire, contextual interaction, or held terminal channel.
4. Enemy perception, suspicion, navigation, attack wind-up, and movement.
5. Bullet movement/collision and damage resolution.
6. Pickup collection, effects lifetime and rig posing.
7. Camera and throttled HUD presentation.

- Positions are world units; **z is up**, and one tile is 16 units. Gameplay remains independent of viewport pixels.
- Player and AI navigation use the map that collision and sight use. Shape solids add exact rotated boxes to collision; the extension includes them in sight and navigation.
- A terminal requires sustained interaction. Letting go, moving out of range, or taking damage clears the channel.
- An attack consumes ammunition once; reloading transfers from reserve and clamps its timer to zero. Weapon changes are blocked only during an active reload.
- Every enemy dies once and produces one pickup. Dead bodies no longer damage or detect. Kill/nonlethal accounting is exclusive.
- A quickhack spends RAM only when its target/cost is valid. Short circuit is nonlethal. Cloak is broken by firing/takedowns. Memory wipe clears suspicion.
- Modal game screens suspend the simulation. The engine standard pause also suspends physics. The title inactivity service continues through its settings screens.
- A checkpoint includes quest flags, ending choice, player inventory/implants/resources, enemy state, and collected/uncollected drops. Gate geometry is reconstructed from saved flags.
- Attract worlds are disposable. Checkpoint and record writes are excluded for them. Scene changes clear projectiles/particles and create fresh actors.
- Event history: 160 entries. Frame history: 600 samples. Demo history: 50 runs. Facade cache: at most 49 entries before eviction. Bullet pool: 96. These do not grow with kiosk uptime.

## Add another heist level

Create a module exporting a level object, then call `registerLevel(level)` before constructing the app. `Cybergrit.startRun(false, 'your-level-id')` starts it, and checkpoints restore by that registered ID. The existing heist mission verbs are reusable across maps.

```js
import { LOWLIGHT, registerLevel } from './level.js';

export const SKYLINE = registerLevel({
  ...LOWLIGHT,
  id: 'skyline',
  name: 'SKYLINE DISTRICT',
  spawn: [176, 584],
  // Replace these arrays with the new map's data:
  buildings: [...LOWLIGHT.buildings],
  enemies: [...LOWLIGHT.enemies],
  interactables: [...LOWLIGHT.interactables],
  objectives: LOWLIGHT.objectives.map(o => ({ ...o })),
  dialogue: { ...LOWLIGHT.dialogue },
  securityWalls: [...LOWLIGHT.securityWalls],
  gates: {
    main: { x: 34, y: 18, axis: 'y', length: 4, flag: 'relay' },
    service: { x: 34, y: 9, axis: 'y', length: 3, flag: 'captive' }
  }
});
```

Content schema:

- `width` and `height`: positive tile dimensions. Outer cells are solid boundaries.
- `buildings`: `{id,x,y,w,d,h,color,neon,sign,sub,face}`. Footprints use tile coordinates; height uses world units. Rendering and collisions derive from the same rectangle. IDs must be unique across buildings in a level.
- `securityWalls`: `{x,y,axis:'x'|'y',length}` in tiles. `gates.main` and `gates.service` cut passages into them.
- `interactables`: `{id,kind,x,y,name,role}` in world units. The reusable heist roles are `rook` (contract), `iris` (clinic), `captive` (optional rescue), `relay`, `core`, `exit`, `cache`; `shard` is optional fiction. Display names/dialogue can be replaced without changing the role IDs.
- `enemies`: unique `{id,kind:'guard'|'boss',x,y,facing,route,asleep?}`. Routes are arrays of world-space `[x,y]`. Guards share patrol/search/fire behavior. The boss has armor and a ground-pulse attack. `encounter.bounds` and `encounter.stage` define its wake trigger.
- `cover`, `props`, `civilians`, `zones`: world-space scene content. Static props use shape IDs registered by `assets.js`; tangible props are also solid geometry. `buildings` and `cover` are baked into the TileMap.
- `objectives`: ordered `{title,text,target}` for contract → relay → archive → choice → extraction. `dialogue` supplies role-keyed speakers, prose and choices.

The expansion test registers a separate map ID with relocated gates, renamed objectives and a seventh patrol, completes the contract with the same director, and round-trips it through save validation. New maps using the existing verbs do not require changes to simulation, saves, controller input, or physics.

New game-wide verbs/archetypes naturally need new behavior: add a definition and a handler in `world.js`, emit an event, present it through `main.js`, and cover its state transition. Keep map-specific coordinates and prose in the content module. Arbitrary new mission genres, vehicle driving, multiplayer, and a campaign selector are outside this one-level slice.

## Inspect and reproduce

`My3D2dge.current.debug.snapshot()` returns the current scene, player, objectives, hostiles, quest flags and recent events. `.debug.perf()` returns timing history. `.debug.teleport(x,y)` is a development aid. The optional engine session recorder can record/replay input via `E.session`; its documented tools are in the upstream handoff. The project's tests instead drive the exact fixed-step simulation and browser Gamepad API directly.

`tests/systems.test.mjs` verifies simulation invariants and complete runs. `tests/browser.mjs` verifies live input, focus, pause, dialogue, save reload, title-submenu idle behavior, three ending loops, cancellation devices, frame rate, and WebKit/Firefox operation. Tests do not require external accounts, game services, or an API key.
