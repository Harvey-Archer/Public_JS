# Classroom Vocabulary Game Suite

> An all-in-one classroom vocabulary toolkit featuring **Memory Matching**, **Casino Shuffle Flashcards**, **Scramble Cards**, and a **Team Starboard Reward System**.

**Version:** 2.4.4-phase-one-hardening  
**Release Date:** 2026-07-05  
**Author:** Abdelaziz Amejjoud

---

# Overview

Classroom Vocabulary Game Suite is a self-contained browser application designed for ESL, EFL, primary, and vocabulary-focused classrooms.

Teachers can:

- Upload lesson images
- Attach vocabulary words to those images
- Run interactive memory matching games
- Present vocabulary through casino-style flashcards
- Practice spelling using scramble challenges
- Manage classroom teams and rewards
- Award stars and convert performance into classroom dollars

The entire application is contained in a **single HTML file**, making it easy to distribute, run offline, and customize.

---

# Main Features

## 🧠 Vocabulary Memory Game

Create image-to-word memory matching activities.

### Features

- Upload unlimited lesson images
- Assign a vocabulary word to each image
- Drag & drop image uploads
- Paste screenshots directly from clipboard
- Shuffle vocabulary pairs
- Dynamic board sizing
- Match tracking
- Move counter
- Peek cards mode
- One-click restart
- Confetti celebration on completion

### Teacher Workflow

1. Upload images
2. Type vocabulary words
3. Click **Play Memory**
4. Students match words with pictures

---

## 🎲 Casino Shuffle

A more dramatic vocabulary review mode.

### Features

- Large draggable flashcards
- Face-up / face-down card states
- Focus mode
- Reveal mode
- Auto-Wash shuffle animation
- Free card movement around the screen
- Review Belt for reviewing all lesson cards

### Classroom Use

Ideal for:

- Team competitions
- Random vocabulary selection
- Review sessions
- Warm-up activities

---

## 🔤 Scramble Cards

Vocabulary spelling activity with configurable difficulty.

### Difficulty Levels

#### Easy

- First and last letters remain stable
- Middle letters shuffled

Example:

```text
elephant → eelhpant
```

#### Medium

- First letter remains stable
- Remaining letters shuffled

Example:

```text
elephant → eptenahl
```

#### Hard

- Full randomization

Example:

```text
elephant → pantehle
```

### Features

- Automatic vocabulary synchronization from the Memory Game
- Additional Scramble-only words
- Teacher control panel
- Auto play mode
- Previous/Next navigation
- Reshuffle current word
- Progress tracking

---

## ⭐ Teams Starboard

Built-in classroom reward management system.

### Features

- Create classroom teams
- Assign custom colors
- Award and remove stars
- Live scoreboard
- Floating mini-scoreboard
- Animated reward effects
- Reward progress visualization
- JSON export

### Reward System

The leading team earns classroom dollars using the built-in conversion rule:

```text
$1 per 3 stars
```

The application displays:

- Current leader
- Reward progress
- Earned classroom dollars
- Visual dollar bank

---

# Application Structure

The project is intentionally distributed as a **single-file application**.

```text
Vocab_Suite_v2.4.4_Phase_One_Hardening.html
│
├── HTML UI
├── CSS Styling
├── Memory Game Module
├── Casino Shuffle Module
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
├── Memory App
│   ├── Upload System
│   ├── Pair Management
│   ├── Memory Board
│   └── Casino Shuffle
│
├── Scramble App
│   ├── Teacher Controls
│   ├── Scramble Engine
│   └── Auto Play
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

Stores:

- Uploaded images
- Vocabulary assignments
- Card states
- Match progress

---

## Teams Module

```javascript
teams[]
```

Stores:

- Team names
- Team colors
- Star counts
- Reward calculations

---

## Scramble Module

```javascript
words[]
extraWords[]
currentDifficulty
```

Stores:

- Lesson vocabulary
- Teacher custom vocabulary
- Difficulty settings

---

# Local Storage

The application requires no backend.

All persistence is handled using browser `localStorage`.

## Keys

### Teams

```text
starboard_v1
```

Stores:

- Teams
- Scores
- Colors

### Scramble Extra Words

```text
scramble_extra_words_v3
```

Stores:

- Teacher-added scramble vocabulary

### Scramble Difficulty

```text
scramble_diff_v2
```

Stores:

- Easy
- Medium
- Hard setting

---

# Export Format

The Teams Starboard supports JSON export.

Example:

```json
{
  "version": "2.4.4-phase-one-hardening",
  "date": "2026-07-05",
  "teams": [
    {
      "id": "team123",
      "name": "Blue Rockets",
      "color": "#6ec1ff",
      "stars": 12
    }
  ]
}
```

---

# Accessibility

Accessibility was considered throughout the application.

### Included

- ARIA labels
- Screen reader hints
- Keyboard navigation
- High-contrast controls
- Semantic roles
- Reduced motion support

---

# Performance Notes

The application is optimized for classroom devices.

### Techniques Used

- Modular IIFE architecture
- Minimal DOM updates
- CSS-driven animations
- RequestAnimationFrame rendering
- Lightweight particle effects
- Dynamic grid calculations
- Reduced motion detection

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

No frameworks are required.

No installation step is required.

No package manager is required.

---

## Important Global Objects

### Version Metadata

```javascript
window._vocabSuiteVersion
```

Provides:

```javascript
{
  version: "2.4.4-phase-one-hardening",
  date: "2026-07-05"
}
```

### Vocabulary Module

```javascript
window._vocabApp
```

Exposes limited debugging helpers.

### Scramble Module

```javascript
window._scrambleApp
```

Used for synchronizing lesson vocabulary.

---

# Extending The Application

Common extension points include:

### Add New Activities

Create a new activity container and connect it through:

```javascript
setActiveApp()
```

### Add New Reward Types

Extend:

```javascript
getRewardState()
```

and

```javascript
renderRewardBank()
```

### Add Storage Features

Extend localStorage handling functions:

```javascript
load()
save()
```

patterns already used in the Teams and Scramble modules.

### Add Import Functionality

A Teams export system already exists and can be expanded into a full import/export workflow.

---

# Classroom Recommendations

### Best for Small Classes

- Memory Game
- Scramble Cards

### Best for Large Classes

- Casino Shuffle
- Teams Starboard

### Best Combined Flow

```text
1. Upload lesson images
2. Memory Game
3. Casino Shuffle Review
4. Scramble Cards
5. Team Rewards
```

---

# Technical Requirements

## Browser Support

Modern browsers supporting:

- ES6+
- Flexbox
- CSS Grid
- Local Storage
- FileReader API
- Drag & Drop API
- Pointer Events

Recommended:

- Chrome
- Edge
- Firefox

---

# Version

```text
2.4.4-phase-one-hardening
```

This release focuses on:

- UI consistency
- Activity bar unification
- Accessibility improvements
- Reduced motion support
- Performance hardening
- Reward system polish
- Casino review enhancements

---

# License

© 2026 Abdelaziz Amejjoud. All rights reserved.

For custom classroom features, implementations, or new activity ideas, contact the author.
