# 🌊 Ocean Explorer

An interactive 3D underwater exploration experience, built with React and React Three Fiber
for a front-end development internship.

**Status: original 4-phase plan complete; upgrade priority 2 (Target Lock, Scan Mode, Sonar,
Navigation, Mini-map) done, plus a mini-map positioning fix from real feedback and a small
round of robustness/performance additions. Missions, achievements, statistics, and zone
completion are next.**

## Project Overview

Ocean Explorer lets you swim through a 3D ocean, explore five distinct depth zones, find
marine life and objects, and keep a personal log — including your own notes — of what you've
discovered. The 3D scene is the centerpiece, not a background: every creature and object is a
real, clickable Three.js object, not an image.

## Features

- Full-screen 3D ocean scene with a free-swim camera: smooth accelerating/decelerating WASD
  movement, mouse-look via pointer lock, vertical movement with Space/Shift
- Five distinct ocean zones (Sunlit, Twilight, Midnight, Abyssal, Hadal), each with its own
  fog, lighting, floor/particle color, and creature roster — reef life (coral, kelp) only
  appears in the two lit zones, matching how real reefs work
- Zone selector with a fade transition and title card between zones
- 13 marine life entries and 4 world objects (shipwreck, buoy, statue, hydrothermal vent),
  each a low-poly 3D shape built from reusable "archetype" components, with idle motion
- Crosshair-based hover targeting (a raycast from the camera's own forward direction, since
  pointer-lock mouse-look hides the OS cursor) — look at something to highlight it, click to
  open its info panel
- Search with category and zone filters across every entry; selecting a result switches zones
  if needed, spawns you near it, and opens its panel
- Reusable glassmorphism info panel (side panel on desktop, bottom sheet on mobile)
- Discovery tracking, persisted to Local Storage, with a toast notification the first time you
  find something new
- Dive Journal: add, edit, and delete a personal note per discovered entry, from the
  Discoveries page — full CRUD on real user content, with basic validation (empty notes can't
  be saved)
- Settings panel (sound, motion effects, learning mode, show HUD, creature labels, graphics
  quality), persisted to Local Storage and reachable from any page
- A minimal synthesized ambient hum for the Sound setting — not a sample file, generated with
  the Web Audio API, so there's no asset that can fail to load
- Touch controls for mobile: virtual joystick, drag-to-look, rise/dive buttons, and a tap-to-
  interact button, since pointer lock isn't available on touch
- Target lock HUD: a name label near the crosshair for whatever's currently targeted, with a
  scan-progress ring (hold E on desktop, or tap Interact on touch)
- Real sonar: a sweep button that computes actual distances from the camera to every
  registered creature/object within range and lists them nearest-first — not placeholder text
- Point-of-interest navigation: "Navigate here" on any info panel sets a live distance +
  directional-arrow HUD toward it, with an arrival notification
- A mini-map showing real nearby positions (not a static image), desktop only — hidden on
  touch rather than guessed-at on an already-crowded screen
- An error boundary around the whole app — a rendering crash anywhere shows a reload screen
  instead of a blank page; discoveries and settings are unaffected since they're in Local
  Storage, not component state
- The 3D scene (and the Three.js/React Three Fiber/drei code it pulls in) now loads as its
  own chunk behind a real loading screen, instead of blocking the whole app's first paint —
  dropped the main JS bundle from ~1.07MB to ~174KB
- A "Reset progress" option in Settings, for clearing discoveries and journal notes during
  testing
- WebGL support detection with a clean fallback screen
- Responsive HUD and navigation shell (Explore / Discoveries / About / Settings)

## Technologies

- React 18 + Hooks (state, effect, memo, callback, ref, context)
- Three.js + React Three Fiber + @react-three/drei
- Bootstrap 5
- Vite
- Local Storage (discoveries, journal entries, settings)
- Web Audio API (synthesized ambient sound)

## Installation

```bash
npm install
```

## Running locally

```bash
npm run dev      # start the dev server
npm run build     # production build
npm run preview   # preview the production build locally
```

## Controls

| Action | Desktop | Touch |
|---|---|---|
| Look around | Click the scene, then move the mouse (pointer lock) | Drag anywhere |
| Swim / strafe | WASD or arrow keys | Left-side joystick |
| Rise / dive | Space / Shift | Right-side up/down buttons |
| Interact with target | Click | "Interact" button |
| Release mouse | Esc | — |

Menus (Search, zone list, Settings) need the mouse released first on desktop — press Esc, or
just click a creature, which releases it automatically when its info panel opens.

## Ocean zones

Five zones are defined in `scripts/data.js`, each carrying its own fog, lighting, floor and
particle color, and whether it has reef life. Zones are separate "rooms" rather than one
continuous 6000m-deep space — real scale would mean swimming through kilometers of empty
water between them — so depth within a zone is calculated from the camera and then scaled
into that zone's real depth range for display (`pages/Home.jsx`). Switching zones triggers a
fade + title card. `scripts/OceanZones.jsx` is the selector UI; `scripts/OceanScene.jsx` reads
the active zone's config to build the environment, including graphics-quality-adjusted
particle counts and shadows from the Settings panel.

## 3D interaction

Everything in the scene is built from plain Three.js geometry, not loaded models, so nothing
can break from a missing asset. Marine life and objects share a handful of reusable low-poly
"archetypes" (fish, shark, ray, turtle, jelly, cephalopod, whale, anglerfish, shipwreck, buoy,
statue, vent) that each data entry picks by name — see `scripts/MarineLife.jsx`. Targeting is
a raycast from the camera's forward direction each frame (`scripts/Interactables.jsx`), which
also makes it input-agnostic: it works the same whether look-rotation came from the mouse or
a touch drag.

## Search system

`scripts/Search.jsx` searches name and scientific name across every entry, with category
(animal/object) and zone filters. Selecting a result switches to its zone if needed, spawns
you near it, and opens its info panel.

## Discovery system

`scripts/DiscoverySystem.jsx` marks an entry discovered the moment its info panel opens
(desktop click, touch tap, or search selection all funnel through the same `activeEntity`
state, so nothing has to remember to mark discovery separately). Discovered state and the
Dive Journal's notes are both persisted to Local Storage. `pages/Discoveries.jsx` is the log —
locked entries just show a lock icon; discovered ones expand into their description and the
journal editor (add, edit, delete a note, 500-character limit, save disabled on empty input).

## Local storage

`scripts/storage.js` is a small safe read/write wrapper — invalid or missing data never
crashes the app, it just falls back to a default. Three keys are used: `discovered`,
`journal`, and `settings`.

## Responsive design

Base breakpoints are in `styles/responsive.css`; the info panel becomes a bottom sheet under
768px. Below that width (or on any touch-capable device), `pages/Home.jsx` swaps the desktop
hint text and pointer-lock camera for `scripts/MobileControls.jsx`'s joystick/drag/button
scheme — touch capability is detected once on mount, so toggling a browser dev-tools device
emulator without reloading the page won't switch modes.

## Performance optimization

- Bubbles render as a single instanced mesh rather than dozens of separate objects
- Graphics quality setting (Low/Medium/High) scales bubble and particle counts, shadow
  rendering, and device pixel ratio
- Motion-effects setting reduces idle-animation amplitude for lower-powered devices or anyone
  who prefers less movement, alongside a `prefers-reduced-motion` CSS fallback
- Decorative geometry (rocks, coral, kelp) uses low-poly primitives, not model imports
- Each zone only renders its own creatures/objects, not all 17 entries at once

## Deployment

```bash
npm run build
```

Deploy the `dist/` folder to Vercel or Netlify (drag-and-drop the folder, or connect the repo
and set the build command to `npm run build` and the output directory to `dist`).

## Known risk areas

Built without a browser to actually look at or a touch device to test on, verified only by
`npm run build`, booting the dev server, and careful manual code review — real, but partial,
verification. Before you submit or record your walkthrough, check these specifically:

- **Touch controls** are the biggest unknown — joystick feel, look sensitivity
  (`TOUCH_LOOK_SENSITIVITY` in `scripts/Controls.jsx`), and whether the on-screen buttons
  overlap awkwardly on a real phone screen, not just a resized desktop browser.
- **Settings actually taking effect inside the 3D scene** (motion effects, learning mode,
  creature labels) rely on React Context reaching components rendered inside the Canvas. This
  is standard, reliable React Three Fiber behavior, but it's still worth toggling each one and
  confirming you see a difference.
- **The three darkest zones' lighting** (Midnight/Abyssal/Hadal) was deliberately biased
  brighter than "extreme darkness" would technically call for, since an earlier phase shipped
  a scene that was genuinely empty on screen and looked fine in code. Worth a look in case it
  overshot the other way and doesn't feel distinct enough from the lit zones.
- **Sound** is a real synthesized tone, not a placeholder, but it has never been heard by
  anything that built it.
- **The mini-map and navigation arrow's sense of direction** (`scripts/Interactables.jsx`,
  the `atan2` bearing math) is reasoned through carefully but never watched move — worth
  confirming the arrow actually points toward, not away from, your destination, and that the
  map's dots track your real position as you swim.
- **HUD density**: target lock, scanner ring, sonar, mini-map, and navigation are now all
  sharing screen space with the zone list, search, and depth readout. Worth a look at whether
  anything visually collides, especially around 1024–1366px laptop widths.

## Future improvements

Sonar, compass, submarine mode, and a larger creature/object roster (the spec describes up to
50 discoverable entries; 17 are seeded) are reasonable next additions once the above is
confirmed solid, but weren't part of the planned 4 phases.
