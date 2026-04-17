# Champions DB — Development Log

## Project Overview
Single-file React app (`champions-db.html`) — competitive Pokémon Champions database for **Regulation M-A** (April 8 – June 17, 2026). Built with React 18 + Babel Standalone, Tailwind CDN, and PokeAPI v2.

---

## Architecture
- **No build step** — single HTML file, Babel transpiles JSX in the browser.
- No `import`/`export` — destructure from `React` at the top: `const { useState, useEffect, useCallback, useMemo, useRef } = React;`
- CDNs: React 18.2 (cdnjs), ReactDOM 18.2, Babel 7.23.2, Tailwind CDN
- Sprites: `https://play.pokemonshowdown.com/sprites/ani/{sdSlug|slug}.gif`
- Item sprites: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/{itemSprite}.png`
- Pokémon data: `https://pokeapi.co/api/v2/pokemon/{slug}`
- Move data: `https://pokeapi.co/api/v2/move/{moveName}`

---

## Key Constants
- `ROSTER` — 191 Pokémon eligible for Reg M-A, with `{ name, slug, id, types[], sdSlug?, form? }`
- `TYPES` — 18-element array in canonical order (index used for TYPE_CHART lookups)
- `TYPE_CHART[attacker][defender]` — 18×18 effectiveness matrix
- `ITEMS` — sorted alphabetically, `{ name, category, itemSprite, effect }`
- `USAGE` — Pikalytics top-25 usage percentages
- `SYNERGIES` — curated VGC core strategies
- `pokemonCache` — module-level cache for PokeAPI responses (avoids re-fetching)
- `moveTypeCache` — module-level cache for move type lookups

---

## Type Effectiveness Logic (CRITICAL)
**Defensive matchups** — to find what types hit a Pokémon:
```js
TYPES.forEach((attackType, attIdx) => {
  let mult = 1;
  pokemon.types.forEach(defType => {
    mult *= TYPE_CHART[attIdx][TYPES.indexOf(defType)];  // row = attacker, col = defender
  });
  // mult === 0 → immune; mult >= 2 → weak; mult <= 0.5 → resist
});
```
DO NOT use the Pokémon's types as the attacker row — that gives offensive (incorrect) matchups.

**Scoring priorities (immune > ¼ > ½ > neutral > 2× > 4×)**:
- `mult === 0` → immune → +4 (highest priority)
- `mult <= 0.25` → ×0.25 resist → +3
- `mult <= 0.5` → ×0.5 resist → +2
- `mult >= 4` → ×4 weak → −2
- `mult >= 2` → ×2 weak → −1

---

## Components

### `PokemonTooltip`
- Uses `usePokemon(pokemon.slug)` to fetch stats/abilities
- Correct defensive weakness/resistance/immunity display
- **Flip logic**: checks `mousePos.x + ttW > vw` and `mousePos.y + ttH > vh` to avoid going offscreen

### `TeamSlot`
- One per team slot (6 total)
- Uses `usePokemon` to fetch: abilities, full move list
- Ability display: regular (⚡) and hidden (◇), shows type-immunity badges via `ABILITY_IMMUNITIES`
- Item dropdown: alphabetically sorted
- Move dropdowns: 4 moves, populated from full PokeAPI move list; fetches move type on selection via `moveTypeCache`
- Pokémon picker: text search → dropdown list from ROSTER

### `TeambuilderTab`
- Defensive chart: rows = 18 attacker types, columns = team slots (shows Pokémon name, not "Slot X")
- Typechart colors: immune (blue) > ¼ (teal) > ½ (green) > neutral (dark gray) > 2× (orange) > 4× (red)
- Offensive coverage: appears when ≥ 1 slot has moves assigned; shows best effectiveness per Pokémon vs each defending type
- Suggestions: score relative to the team's current ± balance per type (`typeMatchups[i].score`)
  - `teamScore < 0` = real residual weakness → candidate immune/resist = bonus, weak = penalty
  - `teamScore >= 0` = team balanced or covered → candidate weakness = 0 (not penalized)
  - immune always +1 even on covered types (strategic value); immune on hole = +4
  - ×0.25 on hole = +3 · ×0.5 on hole = +2 · ×2 on hole = −2 · ×4 on hole = −4

### `ABILITY_IMMUNITIES`
```js
const ABILITY_IMMUNITIES = {
  'levitate': ['ground'],      'flash-fire': ['fire'],
  'water-absorb': ['water'],   'volt-absorb': ['electric'],
  'motor-drive': ['electric'], 'lightning-rod': ['electric'],
  'storm-drain': ['water'],    'sap-sipper': ['grass'],
  'earth-eater': ['ground'],   'dry-skin': ['water'],
  'well-baked-body': ['fire'],
};
```

---

## Color Scheme (v3 — clean dark)
```css
--bg: #0a0a0a          /* page background */
--card-bg: #141414     /* card background */
--border: rgba(255,255,255,0.07)
--primary: #6366f1     /* indigo — action buttons, active tabs */
--accent: #a5b4fc      /* light indigo — headings, scores */
--text: #f1f5f9
--text-secondary: #94a3b8
```

---

## Changelog

### v1 — Initial build
- 5-tab layout: Roster, Teambuilder, Items, Synergies, Pokémon detail (stub)
- TYPE_CHART matrix, basic weakness display

### v2 — Round 2 improvements
- Animated sprites via Pokémon Showdown CDN
- Active type filter in Roster
- Hover tooltips with stats
- Full type matrix in Teambuilder
- Item assignment per slot with PokeAPI sprites
- Mega Stone items category
- Real Pikalytics usage data (top 25)
- Red/amber color scheme + site renamed to "Champions DB"

### v3 — Round 3 fixes (2026-04-17)
**Global**
- Reverted red/amber color scheme → clean dark with indigo accent

**Roster**
- Fixed weakness/resistance tooltip: now uses correct *defensive* calculation (attack type iterates all 18, multiplied across defending types)
- Fixed sprite stretching: `.sprite-box` container with `object-fit: contain`
- Prevented adding duplicate Pokémon to team (slug check in `handleAddToTeam`)

**Teambuilder**
- Items dropdown now sorted alphabetically
- Suggestion logic: threshold changed from `>= 2` to `>= 1` (works for first Pokémon)
- Improved suggestion scoring: immunity +4, ×0.25 +3, ×0.5 +2, 2× −1, 4× −2
- Tooltip flip logic: avoids going offscreen near page bottom/right
- Added Pokémon selector dropdown in each team slot (search + pick from ROSTER)
- Added ability display per slot (regular + hidden, with immunity type badges)
- Added full learnset move picker (4 moves per slot, populated from PokeAPI, fetches type on selection)
- Added offensive coverage chart (shows best effectiveness per Pokémon vs all 18 defending types)
- Fixed typechart cell color priority: immune (blue) > ¼ (teal) > ½ (green) > neutral > 2× (orange) > 4× (red)
- Typechart header now shows Pokémon name (first word) instead of "Slot X"
- Immunities shown as "✗" in typechart with blue highlight
