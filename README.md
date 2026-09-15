# 🌊 Ocean Explorer

An interactive 3D underwater exploration experience, built with React and React Three Fiber.

**Status: Phase 3 of 4 — environment, camera, interaction, zones, and search are all working. See "Build status" below.**

## Project Overview

Ocean Explorer lets you swim through a 3D ocean, discover marine life across five depth
zones, and track what you've found. It's a front-end development internship project focused
on genuine 3D interaction rather than a 3D-looking background.

## Build status

| Phase | Scope | Status |
|---|---|---|
| 1 | 3D environment, camera movement, WebGL fallback, page shell | ✅ Done |
| 2 | Interactive marine life & objects, info panels | ✅ Done |
| 3 | Ocean zones & transitions, search/filter | ✅ Done |
| 4 | Discovery system + Dive Journal (CRUD), settings, mobile controls, polish | ⏳ Next |

## Features (current)

- Full-screen 3D ocean scene — procedural seafloor, rocks, coral, swaying kelp, rising bubbles
- Free-swim camera: smooth accelerating/decelerating WASD movement, mouse-look via pointer lock, vertical movement with Space / Shift
- Five distinct ocean zones (Sunlit, Twilight, Midnight, Abyssal, Hadal), each with its own fog, lighting, floor/particle color, and creature roster; reef life (coral, kelp) only appears in the two lit zones, matching how real reefs work
- Zone selector with a fade transition and a zone title card — switching zones is a deliberate teleport with a loading-style moment, not an instant cut
- 13 marine life entries and 4 world objects (shipwreck, buoy, statue, hydrothermal vent), each an interactive low-poly 3D shape with idle motion
- Crosshair-based targeting: look at something to highlight it and see its name, click to open its info panel — this app uses pointer-lock mouse-look, which hides/freezes the OS cursor, so hover is done by raycasting from the camera's own forward direction each frame rather than from mouse position
- Search with category (animal/object) and zone filters across every entry; selecting a result switches zones if needed and spawns you near it, then opens its info panel
- Reusable glassmorphism info panel (side panel on desktop, bottom sheet on mobile) showing name, scientific name, depth, habitat, diet, size, and facts — only for fields a given entry actually has
- Live depth readout, scaled per zone so it always reads within that zone's real depth range
- WebGL support detection with a clean fallback screen
- Responsive HUD and navigation shell (Explore / Discoveries / About)

## Technologies

- React 18 + Hooks
- Three.js + React Three Fiber + @react-three/drei
- Bootstrap 5
- Vite
- Local Storage (wired up in Phase 4)

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

| Action | Desktop |
|---|---|
| Look around | Click the scene, then move the mouse (pointer lock) |
| Swim forward / back | W / S or ↑ / ↓ |
| Strafe left / right | A / D or ← / → |
| Rise / dive | Space / Shift |
| Release mouse | Esc |

Touch controls for mobile arrive in Phase 4.

## Ocean zones

Five zones are defined in `scripts/data.js` (Sunlit, Twilight, Midnight, Abyssal, Hadal),
each carrying its own fog color/distance, lighting, floor and particle color, and whether it
has reef life. Zones are separate "rooms" rather than one continuous 6000m-deep space — real
scale would mean swimming through kilometers of empty water between them, so depth within a
zone is calculated from the camera and then scaled into that zone's real depth range for
display (see `Home.jsx`). Switching zones, from the zone list or a search result, triggers a
fade + zone title card rather than an instant cut. `scripts/OceanZones.jsx` is the selector
UI; `scripts/OceanScene.jsx` reads the active zone's config to build the environment.

## 3D interaction

Everything in the scene — floor, rocks, coral, kelp, creatures, objects — is built from plain
Three.js geometry, not loaded models, so nothing can break from a missing asset. Marine life
and objects are grouped into a handful of reusable low-poly "archetypes" (fish, shark, ray,
turtle, jelly, cephalopod, whale, anglerfish, plus shipwreck/buoy/statue/vent for objects)
that each data entry picks by name — see `scripts/MarineLife.jsx`. Targeting uses a raycast
from the camera's forward direction each frame rather than mouse position, since pointer-lock
mouse-look hides the OS cursor; see `scripts/Interactables.jsx`.

## Search system

`scripts/Search.jsx` searches name and scientific name across every marine life entry and
world object, with category (animal/object) and zone filters. Selecting a result switches to
its zone if you're not already there and spawns you near it, then opens its info panel.

## Discovery system

Planned for Phase 4: clicking a creature or object marks it discovered, persisted to Local
Storage, plus a Dive Journal for adding, editing, and deleting a personal note per discovery.

## Local storage

A safe read/write wrapper already exists in `scripts/storage.js` (never throws on missing or
corrupt data). Discoveries, journal entries, and settings will be stored through it starting
in Phase 4.

## Responsive design

Base responsive breakpoints are in `styles/responsive.css`. Full mobile touch controls (drag
to look, on-screen movement) land in Phase 4.

## Performance optimization

- Bubbles render as a single instanced mesh rather than 70 separate objects
- Device pixel ratio capped at 1.5 to protect frame rate on high-DPI screens
- Decorative geometry (rocks, coral, seaweed) uses low-poly primitives, not model imports

## Deployment

Not yet deployed. Once the project is further along:

```bash
npm run build
```

then deploy the `dist/` folder to Vercel or Netlify.

## Future improvements

Sonar, compass, bioluminescence proximity effects, submarine mode, and ambient sound are
stretch goals for after the core experience (Phases 1–4) is complete and solid.
