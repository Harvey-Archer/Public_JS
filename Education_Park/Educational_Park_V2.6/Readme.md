# Classroom Vocabulary Game Suite

> An all-in-one classroom vocabulary toolkit featuring **Memory Matching**, **Casino Shuffle Flashcards**, **Scramble Cards**, **Synapse Match**, and a **Team Starboard Reward System**.

**Version:** 2.6.6-synapse-path-horizontal-fix  
**Release Date:** 2026-07-17  
**Author:** Harvey Archer

---

# Overview

Classroom Vocabulary Game Suite is a self-contained browser application designed for ESL, EFL, primary, and vocabulary-focused classrooms.

Teachers can:

- Upload lesson images and attach vocabulary words
- Save and load lessons via JSON export
- Run interactive memory matching games
- Present vocabulary through casino-style flashcards
- Practice spelling using scramble challenges
- Connect vocabulary to pictures in the new Synapse Match arena
- Manage classroom teams and rewards
- Award stars and convert performance into classroom dollars

The entire application is contained in a **single HTML file**, making it easy to distribute, run offline, and customize.

---

# Main Features

## 🧠 Vocabulary Memory Game (Main Hub)

Create image-to-word memory matching activities. This section now acts as the primary hub for launching all vocabulary activities.

### Features

- Upload unlimited lesson images (drag & drop or clipboard paste)
- Assign a vocabulary word to each image
- **Save & Load Lessons**: Export your vocabulary lists as `.json` files to reuse later
- Shuffle vocabulary pairs
- One-click launch into Memory Board, Casino Shuffle, Synapse Match, or Scramble Cards

---

## 🎲 Casino Shuffle

A more dramatic vocabulary review mode.

### Features

- Large draggable flashcards
- Face-up / face-down card states
- Focus mode & Reveal mode
- Auto-Wash shuffle animation
- Free card movement around the screen
- Review Belt for reviewing all lesson cards

---

## 🔗 Synapse Match (NEW)

A futuristic vocabulary matching arena.

### Features

- Connect vocabulary nodes to picture nodes through an interactive network
- Continuous path rendering loop draws visible connections between elements
- Visual feedback on successful matches
- Great for interactive whiteboard activities where students draw lines to connect concepts

---

## 🔤 Scramble Cards

Vocabulary spelling activity with configurable difficulty.

### Difficulty Levels

#### Easy
- First and last letters remain stable
- Middle letters shuffled
- Example: `elephant → eelhpant`

#### Medium
- First letter remains stable
- Remaining letters shuffled
- Example: `elephant → eptenahl`

#### Hard
- Full randomization
- Example: `elephant → pantehle`

### Features

- Automatic vocabulary synchronization from the Main Hub
- Additional Scramble-only words
- Teacher control panel
- Auto play mode
- Previous/Next navigation
- Reshuffle current word

---

## ⭐ Teams Starboard

Built-in classroom reward management system.

### Features

- Create classroom teams with custom colors
- Award and remove stars
- Live scoreboard & Floating mini-scoreboard
- Animated reward effects
- JSON export

### Reward System

The leading team earns classroom dollars using the built-in conversion rule:
`$1 per 3 stars`

The application displays:
- Current leader
- Reward progress visualization (1/3, 2/3, and full-cycle)
- Earned classroom dollars
- Visual dollar bank

---

# Application Structure

The project is intentionally distributed as a **single-file application**.

```text
Vocab_Suite_v2.6.6_Synapse_Path_Horizontal_Fix.html
│
├── HTML UI
├── CSS Styling
├── Memory Game Hub (Uploads, Save/Load)
├── Casino Shuffle Module
├── Synapse Match Module
├── Scramble Module
├── Teams Starboard Module
├── Shared Utilities
├── Animation Engine
└── Local Storage Persistence
```

---

# Architecture

## High-Level Module Layout

```text
App Switcher
│
├── Memory App (Main Hub)
│   ├── Upload System & Lesson Save/Load
│   ├── Pair Management
│   ├── Memory Board
│   ├── Casino Shuffle
│   ├── Synapse Match
│   └── Scramble Cards (Launched via activity bar)
│
├── Teams Starboard
│   ├── Team Management
│   ├── Rewards Engine
│   ├── Mini Scoreboard
│   └── Export System
│
└── About Module
```

---

# State Management

The application uses local in-memory state combined with browser persistence.

## Memory Game

```javascript
pairs[]
gameState{}
```
Stores uploaded images, vocabulary assignments, card states, and match progress.

## Teams Module

```javascript
teams[]
```
Stores team names, colors, star counts, and reward calculations.

## Scramble Module

```javascript
words[]
extraWords[]
currentDifficulty
```
Stores lesson vocabulary, teacher custom vocabulary, and difficulty settings.

---

# Local Storage

The application requires no backend. All persistence is handled using browser `localStorage`.

### Keys

- `starboard_v1`: Teams, Scores, Colors
- `scramble_extra_words_v3`: Teacher-added scramble vocabulary
- `scramble_diff_v2`: Easy/Medium/Hard setting

---

# Developer Notes

## Design Philosophy

The codebase follows:
- Single-file deployment
- Module isolation through IIFEs
- Shared utility functions
- Browser-native APIs only
- Zero build process
- Zero dependencies

No frameworks, installation steps, or package managers are required.

## Important Global Objects

### Version Metadata
```javascript
window._vocabSuiteVersion
```
Provides: `{ version: "2.6.6-synapse-path-horizontal-fix", date: "2026-07-17" }`

### Application Navigation
```javascript
setActiveApp(targetId)
openScrambleActivity()
```
Used to toggle between the Main Hub, Teams, and the full-screen Scramble mode.

---

# License

© 2026 Harvey Archer. All rights reserved.

For custom classroom features, implementations, or new activity ideas, contact the author.