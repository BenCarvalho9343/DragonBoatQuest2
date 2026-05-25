# Dragon Boat Quest 2

Dragon Boat Quest 2 is a browser-first HTML Canvas game about Secklow Hundred Dragon Boat Club travelling through a full dragon boat racing season.

This project is currently in Phase 8.5: Tiled Caldecotte map integration.

## Running The Game

Start a small local server from the project folder:

```sh
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

No build step is required.

## Current Phase

Current progress includes:

- Canvas setup
- Basic game loop
- Keyboard input tracking
- Placeholder title screen
- Transition from title screen to a blank test map screen
- Data-backed test map
- Smooth player movement with arrow keys or WASD
- Tile collision
- Camera following
- Map registry
- Spawn points
- Exits between maps
- Basic transition messages
- Placeholder NPCs on maps
- Spacebar interaction with facing NPCs
- Speaker-labelled dialogue boxes
- Multi-line dialogue advancement
- Story flags
- Dialogue that changes after flags are set
- Flag-gated map exits
- Shared progress state for future crew, inventory, and trophies
- Canvas-based player name entry
- Player name stored in game state
- `[name]` replacement in dialogue
- Opening Coach Tim dialogue before player control unlocks
- Caldecotte Lake map slice
- Caldecotte NPC placement
- Crew recruitment for Lesley, Marcus, Dan, and Naomi
- Crew screen opened with `C`
- Dock race-day gate
- Tiled JSON map loading
- Pixel-art Caldecotte tileset rendering
- Object-layer spawns, NPCs, interactables, and collision shapes

## Planned Direction

The first major playable target is the Caldecotte Lake prologue.
