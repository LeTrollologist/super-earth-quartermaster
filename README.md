```
 ██████╗ ██╗   ██╗ █████╗ ██████╗ ████████╗███████╗██████╗ ███╗   ███╗ █████╗ ███╗   ██╗
██╔═══██╗██║   ██║██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██╔══██╗████╗  ██║
██║   ██║██║   ██║███████║██████╔╝   ██║   █████╗  ██████╔╝██╔████╔██║███████║██╔██╗ ██║
██║▄▄ ██║██║   ██║██╔══██║██╔══██╗   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══██║██║╚██╗██║
╚██████╔╝╚██████╔╝██║  ██║██║  ██║   ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║  ██║██║ ╚████║
 ╚══▀▀═╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝

                        S U P E R   E A R T H   Q U A R T E R M A S T E R
```

<div align="center">

[![Deploy](https://img.shields.io/badge/deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://super-earth-quartermaster.onrender.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Zustand](https://img.shields.io/badge/State-Zustand-FF6B35?style=for-the-badge)](https://zustand-demo.pmnd.rs)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

**Advanced loadout builder and multi-dimensional synergy engine for Helldivers 2 — built for democracy.**

[**🚀 Live Demo**](https://super-earth-quartermaster.onrender.com) · [Report Bug](https://github.com/LeTrollologist/super-earth-quartermaster/issues) · [Request Feature](https://github.com/LeTrollologist/super-earth-quartermaster/issues)

</div>

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Data Reference](#data-reference)
5. [Suggestion Engine](#suggestion-engine)
6. [Synergy System](#synergy-system)
7. [Warbond Color Reference](#warbond-color-reference)
8. [Playstyle Archetypes](#playstyle-archetypes)
9. [Getting Started](#getting-started)
10. [Build & Deploy](#build--deploy)
11. [URL Sharing & Loadout Codec](#url-sharing--loadout-codec)
12. [Contributing](#contributing)
13. [Disclaimer](#disclaimer)

---

## Features

### 🎯 Loadout Builder

- **8 configurable slots** — Primary, Secondary, Throwable, Armor, 4× Stratagem, Booster
- **Warbond color-coding** — each item carries its warbond's distinct color as a left-border accent and an inline pill badge, making set identification instant
- **Live stat bars** — normalized per-stat bar charts update in real time as you equip items
- **Side-by-side comparison** — hover any two items to see a full delta stat breakdown
- **Shareable loadouts** — entire loadout state encoded in a single `?loadout=` URL query param; copy and paste to share with squadmates

### 🤖 Suggestion Engine

- **SUGGEST ALL** — scores every item in the database across all 8 slots simultaneously, surfacing the globally optimal loadout for your current context
- **BUILD AROUND** — lock one anchor item (any slot: primary, secondary, throwable, armor, or stratagem), then let the engine optimize every other slot to complement it
- **Per-slot alternatives** — each suggestion shows 3 inline alternatives with their own scores, so you can swap one piece without re-running
- **Rationale strings** — every suggestion includes 1–3 human-readable reasons explaining *why* the engine chose it (e.g., *"High AP tier penetrates Bile Titan armor"*, *"Inflammable passive mitigates fire tornado damage"*)

### ⚙️ 5-Dimensional Synergy System

Each dimension is individually toggleable — mix and match as needed:

| Dimension | What It Weights |
|-----------|----------------|
| **Planet** | Armor passive matches active planet conditions (fire tornado → Inflammable, ion storm → Electrical Conduit) |
| **Loadout** | Weapon profile gap-filling — if your primary is slow-firing, secondary/stratagems that spray are boosted |
| **Faction** | AP penetration verification + damage tag overlap vs selected enemy faction |
| **Playstyle** | Archetype trait overlap — Tank Buster scores AT weapons higher, Lone Wolf boosts Scout armor |
| **Mission** | Mission priority weights — Blitz favors mobility, Eliminate Target maxes anti-heavy scoring |

**Synergy Stacking Bonus** — items that score positively across 3 or more active dimensions receive a compounding combo bonus, strongly differentiating "perfectly-fitted" items from single-dimension specialists.

### 📋 Stratagem Allocation

- **AUTO mode** (default) — the engine picks the 4 highest-scoring stratagems freely with no category constraints; purely synergy-driven
- **MANUAL mode** — a combined 4-slot budget displayed as a pip bar, with per-category `−`/`+` controls; the `+` button locks when the 4-slot total is reached, preventing impossible allocations (e.g., 4 Orbitals + 4 Eagles)

Categories: Orbital · Eagle · Support Weapon · Backpack · Sentry · Emplacement · Vehicle

### 🌍 Context Selectors

- **Faction** — Terminids / Automatons / Illuminate (multi-select)
- **Enemies** — individual enemy types per faction, each annotated with armor tier
- **Planet conditions** — 16+ environmental modifiers:

  | Condition | Recommends |
  |-----------|-----------|
  | Fire Tornadoes | Inflammable |
  | Ion Storms | Electrical Conduit, +20% stratagem cooldowns |
  | Toxic Haze / Acid Storms | Advanced Filtration |
  | Sandstorm / Spore Clouds | Advanced Filtration, Scout |
  | Volcanic Activity | Inflammable |
  | Thick Fog | Scout |
  | Stalker Infestation | Scout, Guard Dog Rover |
  | Extreme Cold / Blizzards | Acclimated |
  | Electrical Storms | Electrical Conduit |
  | Meteor Showers | Engineering Kit |
  | Orbital Interference | Eagle Airstrike recommended |

- **Mission** — 8 mission types, each with distinct priority weights (see [Suggestion Engine](#suggestion-engine))

### 🎽 Playstyle Archetypes

10 selectable archetypes shape the scoring of every suggestion. See the full [Playstyle Reference](#playstyle-archetypes).

### 🏷️ Owned Warbonds Filter

Toggle individual warbonds as owned or unowned. When a warbond is marked unowned, all its items are excluded from suggestion scoring and results — no more recommendations for gear you can't equip.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | [React](https://react.dev) | 18.3.1 | Component-based UI, hooks |
| State | [Zustand](https://zustand-demo.pmnd.rs) | 4.5.2 | Global loadout + suggestion state (~4 KB) |
| Styling | [Tailwind CSS](https://tailwindcss.com) | 3.4.6 | Utility-first, custom `hd-*` dark theme |
| Fonts | Rajdhani · Share Tech Mono · Barlow Condensed | — | Military sci-fi aesthetic |
| Bundler | [Vite](https://vitejs.dev) | 5.3.4 | Instant HMR, optimized ESM builds |
| Hosting | [Render.com](https://render.com) | — | Free-tier static site |
| Data Layer | Static JSON | — | All game data, zero runtime DB |
| URL Codec | Base64 + URLSearchParams | — | Shareable loadout URLs |

> No backend, no database, no auth. Everything runs in the browser against local JSON.

---

## Architecture

```
super-earth-quartermaster/
├── index.html                          # Vite HTML entry
├── vite.config.js                      # React plugin, no custom base
├── tailwind.config.js                  # hd-* palette, custom fonts, scanline animation
├── render.yaml                         # Render static site config
└── src/
    ├── App.jsx                         # Root — mounts URL sync + AppShell
    ├── main.jsx                        # ReactDOM.createRoot
    ├── index.css                       # Tailwind directives + CRT scanline effect
    │
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.jsx            # 3-column grid (loadout | browser | stats)
    │   │   └── Header.jsx              # Top bar, "SUGGEST LOADOUT" button
    │   │
    │   ├── loadout/
    │   │   ├── LoadoutPanel.jsx        # Left sidebar — all 8 slot controls
    │   │   ├── LoadoutSlot.jsx         # Single slot: warbond color border, item display
    │   │   ├── FactionSelector.jsx     # Faction / enemy / condition toggles
    │   │   └── ShareButton.jsx         # Copies ?loadout= URL to clipboard
    │   │
    │   ├── browser/
    │   │   ├── ItemBrowser.jsx         # Center pane — filterable, sortable item list
    │   │   └── ItemCard.jsx            # Item row: warbond left border + pill, AP badge
    │   │
    │   ├── stats/
    │   │   ├── StatsPanel.jsx          # Right sidebar — switches between stat views
    │   │   ├── WeaponStats.jsx         # Damage / fire rate / AP bar chart
    │   │   ├── ArmorStats.jsx          # Armor rating / speed / stamina
    │   │   ├── StratagemStats.jsx      # Arrow sequence + cooldown visualization
    │   │   ├── BoosterStats.jsx        # Effect text + tags
    │   │   ├── ComparePanel.jsx        # Side-by-side delta comparison
    │   │   └── StatBar.jsx             # Reusable normalized progress bar
    │   │
    │   ├── suggestions/
    │   │   └── SuggestPanel.jsx        # Full suggestion modal:
    │   │                               #   Tab 1: SUGGEST ALL
    │   │                               #   Tab 2: BUILD AROUND
    │   │                               #   Left: context selectors, synergy toggles,
    │   │                               #         stratagem budget, owned warbonds
    │   │                               #   Right: scored results per slot + alternatives
    │   │
    │   └── ui/
    │       ├── APBadge.jsx             # AP tier pill (1–6, color-coded)
    │       ├── CategoryBadge.jsx       # Item category tag (AR, SG, Orbital…)
    │       ├── DamageTypeBadge.jsx     # Damage type icon + color
    │       ├── ArrowSequence.jsx       # Stratagem ↑↓←→ button sequence display
    │       └── Tooltip.jsx             # Hover tooltip wrapper
    │
    ├── store/
    │   └── loadoutStore.js             # Zustand store — full state + 30+ actions
    │
    ├── utils/
    │   ├── suggestions.js              # 5-dimensional scoring engine (v2)
    │   ├── loadoutCodec.js             # Base64 encode / decode for URL sharing
    │   └── statCalc.js                 # Stat normalization helpers
    │
    ├── constants/
    │   └── warbonds.js                 # 13 warbonds → { color, label }
    │
    ├── hooks/
    │   ├── useLoadoutURL.js            # Syncs Zustand loadout ↔ ?loadout= param
    │   └── useWarStatus.js             # Live galactic war status hook
    │
    └── data/                           # All static game data (JSON)
        ├── weapons.json                # ~48 items: primaries, secondaries, throwables
        ├── armor.json                  # 30+ sets across all 13 warbonds
        ├── stratagems.json             # 60+ callables with arrow sequences + tags
        ├── boosters.json               # Squad-wide enhancements
        ├── enemies.json                # 3 factions + per-enemy armor tiers
        ├── missions.json               # 8 mission types with priority arrays
        ├── passives.json               # Armor passive name → description map
        ├── planets.json                # War planets + 16 environmental conditions
        └── playstyles.json             # 10 archetypes with full trait / bonus data
```

### State Shape (Zustand)

```js
{
  // ── Loadout slots ──────────────────────────────────────────────────────
  primary:    null,   // weapon object or null
  secondary:  null,
  throwable:  null,
  armor:      null,
  stratagems: [null, null, null, null],
  booster:    null,

  // ── UI / browser ──────────────────────────────────────────────────────
  activeSlot:    'primary',
  hoveredItem:   null,
  compareMode:   false,
  compareItems:  [],

  // ── Context (used for scoring) ────────────────────────────────────────
  selectedFactions:   [],  // ['terminids', 'automatons', 'illuminate']
  selectedEnemies:    [],
  selectedConditions: [],
  activePlanet:       null,

  // ── Suggestion settings ───────────────────────────────────────────────
  stratagemLimits:        { Orbital:1, Eagle:1, 'Support Weapon':1, Backpack:1, Sentry:0, Vehicle:0, Emplacement:0 },
  stratagemLimitsEnabled: false,          // false = AUTO, true = MANUAL budget
  buildAroundItem:        null,           // { item, slotType }
  selectedPlaystyle:      null,           // playstyle id string
  synergyModes:           { planet:true, loadout:true, faction:true, playstyle:true, mission:true },
  suggestMission:         null,           // mission id string
  ownedWarbonds:          Set<string>,    // all 13 by default
}
```

---

## Data Reference

All game data lives in `src/data/` as static JSON — no API calls, instant loads.

### weapons.json

```jsonc
{
  "id": "ar-23p",
  "name": "AR-23P Liberator Penetrator",
  "category": "AR",           // AR | SMG | SG | LMG | DMR | LAS | PLAS | SF | Thrown
  "damage": 60,
  "durableDamage": 30,        // damage to durable limbs
  "fireRate": 250,            // rounds per minute
  "dps": 250,                 // effective DPS
  "capacity": 30,             // magazine size
  "spareMags": 7,
  "recoil": 35,               // 0–100
  "apTier": 3,                // 1 (Soft) → 6 (Impervious)
  "damageType": "Ballistic",  // Ballistic | Explosive | Fire | Arc | Energy
  "effect": null,             // secondary effect string or null
  "traits": ["semi-auto", "mid-range", "anti-medium"],
  "warbond": "Steeled Veterans"
}
```

**Categories:**
`AR` · `SMG` · `SG` · `LMG` · `DMR` · `LAS` · `PLAS` · `SF` · `Thrown`

---

### armor.json

```jsonc
{
  "id": "b-01-tactical",
  "name": "B-01 Tactical",
  "type": "Medium",           // Light | Medium | Heavy
  "armorRating": 100,         // 50–200
  "speed": 500,               // movement speed
  "staminaRegen": 85,         // stamina recovery rate
  "passive": "Engineering Kit", // passive ability name (see passives.json)
  "warbond": "Helldivers Mobilize"
}
```

---

### stratagems.json

```jsonc
{
  "id": "orbital-precision-strike",
  "name": "Orbital Precision Strike",
  "category": "Orbital",     // Orbital | Eagle | Support Weapon | Backpack | Sentry | Emplacement | Vehicle
  "sequence": ["↑", "↓", "→"], // directional input sequence
  "cooldown": 80,             // seconds
  "uses": -1,                 // -1 = unlimited
  "activation": 2.5,          // seconds to call in
  "description": "Calls a pinpoint orbital strike on a target location.",
  "tags": ["Anti-Heavy", "Anti-Structure", "Precision", "Automatons"]
}
```

---

### boosters.json

```jsonc
{
  "id": "vitality-enhancement",
  "name": "Vitality Enhancement",
  "description": "Increases the maximum health of all Helldivers.",
  "effect": "maxHealth",
  "tags": ["Survivability", "All Factions"]
}
```

---

### enemies.json

```jsonc
{
  "factions": [
    {
      "id": "terminids",
      "name": "Terminids",
      "color": "#f97316",
      "icon": "🐛",
      "weaknesses": ["Fire", "Explosive", "Anti-Light"],
      "enemies": [
        { "id": "warrior",    "name": "Warrior",    "armorTier": 2 },
        { "id": "charger",    "name": "Charger",    "armorTier": 5 },
        { "id": "bile-titan", "name": "Bile Titan", "armorTier": 6 }
      ]
    }
  ]
}
```

---

### missions.json

```jsonc
{
  "id": "blitz",
  "name": "Blitz",
  "description": "Complete multiple objectives rapidly. Speed is critical.",
  "icon": "⚡",
  "priorities": ["Mobility", "Versatile"],
  "stratagemTags": ["Mobility", "Utility", "Anti-Light"],
  "notes": "Prioritize mobility and self-sufficiency. Light armor recommended."
}
```

---

### planets.json

```jsonc
{
  "id": "malevelon-creek",
  "name": "Malevelon Creek",
  "status": "contested",
  "biome": "jungle",
  "terrain": "dense",
  "conditions": ["toxic_haze", "thick_fog"]
}
```

**All 16 conditions:** `fire_tornados` · `extreme_cold` · `toxic_haze` · `acid_storms` · `blizzards` · `electrical_storms` · `meteor_showers` · `extreme_heat` · `thick_fog` · `rainstorm` · `sandstorm` · `spore_clouds` · `volcanic_activity` · `ion_storms` · `stalker_infestation` · `orbital_interference`

---

### playstyles.json

```jsonc
{
  "id": "tank-buster",
  "name": "Tank Buster",
  "subtitle": "Breach & Destroy",
  "icon": "🛡️",
  "description": "Specialized in eliminating heavily armored threats with precision and overwhelming firepower.",
  "primaryTraits": ["anti-tank", "anti-heavy", "explosive", "precision"],
  "avoidTraits": ["anti-light", "spray"],
  "preferredArmor": ["Medium", "Heavy"],
  "preferredStratagemTags": ["Anti-Tank", "Anti-Heavy", "Precision"],
  "armorTypeBonus": { "Heavy": 10, "Medium": 5, "Light": -5 },
  "factionBonus": ["automatons"],
  "favoredStratagems": ["recoilless-rifle", "orbital-railcannon-strike", "spear"]
}
```

---

## Suggestion Engine

The suggestion engine (`src/utils/suggestions.js`) is the core of the app — a multi-dimensional scoring system that evaluates every item in the database against your active context.

### Scoring Flow

```
suggestLoadout(ctx)
│
├── Filter by ownedWarbonds → remove unowned items
│
├── For each slot (primary, secondary, throwable, armor, 4× stratagem, booster):
│   │
│   ├── scoreWeapon(candidate, ctx)
│   │   ├─ Base score:      50
│   │   ├─ Faction bonus:   AP tier ≥ enemy armorTier → +10–45 based on tag overlap
│   │   ├─ Mission bonus:   MISSION_WEIGHTS[mission] → area / antiLight / antiHeavy / armorType
│   │   ├─ Planet bonus:    condition active + passive matches → +20 per match
│   │   ├─ Playstyle bonus: trait overlap count × 10
│   │   ├─ Loadout bonus:   getWeaponProfile(anchor) → gap-filling reward/penalty
│   │   └─ Stacking bonus:  3+ positive dims → +(dims − 2) × 8
│   │
│   ├── scoreArmor(candidate, ctx)
│   ├── scoreStratagem(candidate, ctx)
│   └── scoreBooster(candidate, ctx)
│
├── Sort candidates by score desc
├── Pick top 1 as suggestion + top 3 as alternatives
├── If stratagemLimitsEnabled: enforce per-category budget (4 slots total)
│   else: pick top 4 stratagems freely
│
└── buildRationale(item, score, ctx) → string[] for each result
```

### AP Tier Reference

| Tier | Name | Penetrates |
|------|------|-----------|
| 1 | Soft | Flesh, light carapace |
| 2 | Medium | Light armor plating |
| 3 | Heavy | Medium armor plating |
| 4 | Very Heavy | Heavy armor |
| 5 | Armor-Breaking | Thick plates (Charger legs) |
| 6 | Impervious | Bile Titan head, Hulk visors |

> Weapons are only recommended for enemies where `weapon.apTier >= enemy.armorTier`. This is enforced as a hard filter before bonus scoring.

### Weapon Profile (Build-Around Mode)

When BUILD AROUND is active, the engine calls `getWeaponProfile(anchorItem)` to extract boolean capabilities from the locked item:

```js
{
  isHighROF:    // fire rate > 400 RPM
  isLowROF:     // fire rate < 150 RPM or single-shot
  isAT:         // apTier >= 5
  isHeavy:      // apTier >= 4
  isFire:       // damageType === 'Fire' or effect includes fire
  isArc:        // damageType === 'Arc'
  isExplosive:  // damageType === 'Explosive'
  isArea:       // tags include 'Area Denial'
  isSingleShot: // capacity === 1 or traits include 'single-shot'
}
```

`loadoutSynergyBonus(candidate, slot, anchor, currentSlots)` then rewards candidates that fill gaps:

| Anchor Profile | Reward for Candidate | Penalty for Candidate |
|---------------|---------------------|----------------------|
| Low ROF primary | High ROF secondary: +20 | Low ROF secondary: −15 |
| Fire primary | Non-fire secondary: +10 | Fire secondary: −20 (redundant) |
| AT primary | Anti-light secondary: +15 | AT secondary: −10 |
| No area coverage | Area stratagem: +20 | — |

---

## Synergy System

Each of the 5 synergy dimensions can be toggled ON/OFF independently in the SuggestPanel. Disabling a mode removes its contribution from all scores — useful for isolating single-dimension analysis.

| Mode | Max Bonus | What It Checks |
|------|-----------|---------------|
| **Faction** | +45 | AP tier vs enemy armorTier; faction damage tag overlap (15 pts/tag, cap 45) |
| **Planet** | +40 | Active conditions matched against `CONDITION_PASSIVE_BONUS` map; +20 per passive match |
| **Mission** | +35 | `MISSION_WEIGHTS[missionId]` → area damage, anti-light, anti-heavy, armor type coefficients |
| **Playstyle** | +25 | Trait overlap between item traits and archetype `primaryTraits`; armor type bonus from archetype |
| **Loadout** | +30 | Weapon profile gap-filling via `loadoutSynergyBonus()` |
| **Stacking** | +8×n | Items scoring positively on 3+ dimensions get `(n − 2) × 8` compounding bonus |

### How Stacking Works

A weapon that only fits the faction context scores at most `50 + 45 = 95`.

A weapon that fits faction + mission + playstyle context gets: `50 + 45 + 35 + 25 + (3−2)×8 = 163` (clamped to 100).

The stacking bonus means truly versatile items consistently outrank single-dimension specialists when your context is rich — exactly what you want when running with a coordinated squad context.

### Condition → Passive Mapping

| Condition | Recommended Passive |
|-----------|-------------------|
| `fire_tornados` / `extreme_heat` / `volcanic_activity` | Inflammable |
| `extreme_cold` / `blizzards` | Acclimated |
| `toxic_haze` / `acid_storms` / `sandstorm` / `spore_clouds` | Advanced Filtration |
| `electrical_storms` / `ion_storms` | Electrical Conduit |
| `meteor_showers` | Engineering Kit |
| `thick_fog` / `sandstorm` / `stalker_infestation` | Scout |
| `rainstorm` / `orbital_interference` | *(no passive bonus)* |

---

## Warbond Color Reference

All 13 warbonds have distinct accent colors used for item borders, pill badges, filter chips, and loadout slot highlights throughout the UI.

| Warbond | Hex | Preview |
|---------|-----|---------|
| Helldivers Mobilize | `#6b7280` | ![#6b7280](https://placehold.co/12x12/6b7280/6b7280.png) Gray |
| Steeled Veterans | `#3b82f6` | ![#3b82f6](https://placehold.co/12x12/3b82f6/3b82f6.png) Blue |
| Polar Patriots | `#06b6d4` | ![#06b6d4](https://placehold.co/12x12/06b6d4/06b6d4.png) Cyan |
| Democratic Detonation | `#f97316` | ![#f97316](https://placehold.co/12x12/f97316/f97316.png) Orange |
| Cutting Edge | `#22d3ee` | ![#22d3ee](https://placehold.co/12x12/22d3ee/22d3ee.png) Sky |
| Truth Enforcers | `#8b5cf6` | ![#8b5cf6](https://placehold.co/12x12/8b5cf6/8b5cf6.png) Purple |
| Viper Commandos | `#22c55e` | ![#22c55e](https://placehold.co/12x12/22c55e/22c55e.png) Green |
| Freedom's Flame | `#ef4444` | ![#ef4444](https://placehold.co/12x12/ef4444/ef4444.png) Red |
| Servants of Freedom | `#eab308` | ![#eab308](https://placehold.co/12x12/eab308/eab308.png) Yellow |
| Chemical Agents | `#84cc16` | ![#84cc16](https://placehold.co/12x12/84cc16/84cc16.png) Lime |
| Urban Legends | `#ec4899` | ![#ec4899](https://placehold.co/12x12/ec4899/ec4899.png) Pink |
| Borderline Justice | `#f59e0b` | ![#f59e0b](https://placehold.co/12x12/f59e0b/f59e0b.png) Amber |
| Omens of Tyranny | `#7c3aed` | ![#7c3aed](https://placehold.co/12x12/7c3aed/7c3aed.png) Violet |

Colors are defined in `src/constants/warbonds.js` and imported everywhere item colors are needed.

---

## Playstyle Archetypes

10 archetypes shape suggestion scoring by boosting items that align with the chosen role.

| Icon | Archetype | Focus | Best For |
|------|-----------|-------|----------|
| 🛡️ | **Tank Buster** | AP penetration, explosive, precision | Automatons, Bile Titans, Chargers |
| 💨 | **Chaff Clear** | High ROF, area denial, fire | Terminid hordes, Eradicate missions |
| 🐺 | **Lone Wolf** | Scout armor, lightweight, self-sufficient | Blitz, Retrieve, solo flanking |
| 💉 | **Support / Medic** | Utility, team buffs, stims | Squad coordination, Retrieve missions |
| 🔧 | **Engineer** | Sentries, emplacements, demolitions | Defend missions, fortified positions |
| 🤖 | **Mech Pilot** | EXO-45 Patriot synergy, heavy support | Large-scale assaults |
| 🔀 | **Flex** | Balanced across all categories | Any mission type |
| 🐛 | **Bug Diver** | Fire, stun, anti-Terminid specifics | Terminid-exclusive missions |
| 🔩 | **Bot Diver** | Anti-armor, precision, EMP | Automaton-exclusive missions |
| 💎 | **Sample Goblin** | Scout, mobility, light loadout | Sample farming, map traversal |

Each archetype defines:
- `primaryTraits[]` — item traits that get a scoring boost
- `avoidTraits[]` — item traits that get penalized
- `preferredArmor[]` — Light / Medium / Heavy preference with score weights
- `preferredStratagemTags[]` — stratagem tag preferences
- `armorTypeBonus{}` — per-armor-type flat bonus
- `factionBonus[]` — faction IDs where this playstyle shines
- `favoredStratagems[]` — specific stratagem IDs with extra weight

---

## Getting Started

### Prerequisites

- **Node.js** 18+ — [nodejs.org](https://nodejs.org)
- **npm** 9+ (bundled with Node)
- **Git**

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/LeTrollologist/super-earth-quartermaster.git
cd super-earth-quartermaster

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
# → http://localhost:5173 (hot module reload enabled)
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build for production → `dist/` |
| `npm run preview` | Serve the production build locally |

---

## Build & Deploy

### Production Build

```bash
npm run build
# Output: dist/ (optimized, tree-shaken, base64-inlined fonts)

npm run preview
# → http://localhost:4173 (serves dist/ locally for verification)
```

### Render.com Deployment

The app deploys automatically on every push to `master` via `render.yaml`:

```yaml
services:
  - type: web
    name: super-earth-quartermaster
    env: static
    buildCommand: npm run build
    staticPublishPath: dist
```

**Manual setup on Render:**
1. New → Static Site → connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Click Deploy — live in ~2 minutes

> Render's free tier may spin down after inactivity, causing a ~30s cold start on first visit.

### Other Static Hosts

The `dist/` folder is self-contained and can be deployed anywhere:

| Platform | Command |
|----------|---------|
| **Netlify** | Drag-and-drop `dist/` or link repo |
| **Vercel** | `vercel --prod` in project root |
| **GitHub Pages** | Push `dist/` to `gh-pages` branch |
| **Cloudflare Pages** | Build: `npm run build`, output: `dist` |

---

## URL Sharing & Loadout Codec

Loadouts are fully encoded in the URL query string — no account or backend needed.

### How It Works

`src/utils/loadoutCodec.js` serializes the Zustand loadout slots to a compact JSON object, then Base64-encodes it:

```
{ p: "ar-23p", s: "p-2", t: "g-12", a: "b-01-tactical", sg: ["ors", "e110", "rr", "mg43"], b: "vitality" }
         ↓
btoa(JSON.stringify(obj))
         ↓
?loadout=eyJwIjoiYXItMjNwIiwicyI6InAtMiIsInQiOiJnLTEyIiwiYSI6ImItMDEtdGFjdGljYWwiLCJzZyI6WyJvcnMiLCJlMTEwIiwicnIiLCJtZzQzIl0sImIiOiJ2aXRhbGl0eSJ9
```

`src/hooks/useLoadoutURL.js` watches for URL changes on mount and decodes any `?loadout=` param back into Zustand state, restoring the full loadout.

### Sharing

Click the **Share** button in the loadout panel — the current URL (with encoded loadout) is copied to clipboard. Paste it to your squad.

---

## Contributing

All contributions welcome. The project follows a simple data-first architecture — most additions require only JSON edits.

### Adding Game Items

Edit the relevant file in `src/data/`:

```bash
# Add a new weapon
src/data/weapons.json   → add object following the weapon schema

# Add new armor
src/data/armor.json     → add object following the armor schema

# Add a new stratagem
src/data/stratagems.json → add object with correct sequence array
```

### Adding a New Synergy Dimension

1. Add a new key to `synergyModes` in `src/store/loadoutStore.js`
2. Implement the scoring logic in the relevant scorer in `src/utils/suggestions.js`
3. Add a toggle button to the SuggestPanel synergy modes section
4. Update `buildRationale()` with a rationale string for the new dimension

### Code Style

- Tailwind utility classes only — no inline `style={}` except for dynamic color values from `WARBONDS`
- Use `hd-*` color tokens from `tailwind.config.js` (e.g., `text-hd-yellow`, `bg-hd-dark`, `border-hd-border`)
- State mutations go in `loadoutStore.js` — no local state for data that should persist across views
- Keep scoring functions pure — all context passed as arguments, no store reads inside `suggestions.js`

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes with a descriptive message
4. Push and open a PR against `master`
5. Describe what you changed and why in the PR body

---

## Disclaimer

> **Super Earth Quartermaster** is an unofficial fan-made tool created for informational and entertainment purposes. It is not affiliated with, endorsed by, or connected to **Arrowhead Game Studios** or **Sony Interactive Entertainment**.
>
> *Helldivers™*, *Helldivers 2™*, and all related names, logos, images, and game content are the intellectual property of Arrowhead Game Studios AB and Sony Interactive Entertainment LLC.
>
> All item data, faction names, and game mechanics referenced herein belong to their respective owners. No commercial use is intended.

---

<div align="center">

*For Super Earth. For Democracy. For managed democracy.*

**⬆ ⬆ ⬇ ⬇ ⬅ ➡ ⬅ ➡**

</div>
