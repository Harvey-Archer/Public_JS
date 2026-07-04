Unified Memory & Scramble Educational Apps
![Application Type](https://img.shields.io/badge/type-single--file%20web%20app-blue)
![Runtime](https://img.shields.io/badge/runtime-browser%20only-green)
![Storage](https://img.shields.io/badge/storage-localStorage%20%2B%20in--memory-orange)
![Dependencies](https://img.shields.io/badge/dependencies-Google%20Fonts%20only-lightgrey)


Table of Contents
Overview
Application Suite
Feature Matrix
Architecture
User Experience and Workflows
Memory Game App
Casino Shuffle Mode
Scramble Cards App
Teacher Control Panel
Technical Design
State Management
Data Storage and Privacy
Accessibility
Responsive Design
Performance Characteristics
Browser Compatibility
Runtime and Deployment Model
Installation and Usage
Configuration Reference
Keyboard and Interaction Reference
Security Considerations
Known Limitations
Quality Assurance Checklist
Troubleshooting
Recommended Enterprise Improvements
Project Structure
Maintenance Notes
License
---
Overview
Unified Memory & Scramble Educational Apps is a self-contained browser-based learning suite packaged in a single HTML file: `Unified_Memory_Scramble.html`.
The suite combines two classroom-oriented applications behind a shared app switcher:
Vocabulary Memory — an image-to-word matching game where teachers upload pictures, assign vocabulary terms, and launch an interactive memory board.
Scramble Cards — a word/phrase scrambling practice tool with teacher-managed vocabulary, difficulty levels, answer reveal, auto play, keyboard shortcuts, and persistent local settings.
The application is designed for ESL, young learners, vocabulary review, classroom games, warm-ups, and interactive projection-based activities. It runs completely in the browser and does not require a backend server, build step, account system, or database.
---
Application Suite
Included Apps
App	Purpose	Primary Audience	Data Source	Persistence
Vocabulary Memory	Match uploaded images with typed vocabulary words	Teachers and students	Teacher-uploaded image files and typed labels	In-memory only for the current browser session
Casino Shuffle	Physical-card-style reveal/shuffle activity using the uploaded Memory vocabulary set	Teachers and students	Same image/vocabulary pairs from Memory Game	In-memory only for the current browser session
Scramble Cards	Display scrambled words or phrases and reveal answers	Students, guided by teacher	Built-in dictionary or teacher-edited dictionary	Browser `localStorage`
High-Level Capabilities
Single-file deployment.
Browser-native runtime.
No backend dependencies.
Upload, paste, and drag/drop image ingestion for Memory Game.
Dynamic card grid sizing for fullscreen memory play.
Animated card flipping and matching.
Casino-style draggable cards with manual and automatic shuffling.
Teacher-controlled word list for Scramble Cards.
Difficulty modes for word scrambling.
Keyboard shortcuts for classroom speed.
Local persistence for Scramble settings.
Responsive UI for desktop and smaller screens.
---
Feature Matrix
Capability	Vocabulary Memory	Casino Shuffle	Scramble Cards
App switcher navigation	✅	✅	✅
Image upload	✅	Uses Memory data	❌
Clipboard image paste	✅	Uses Memory data	❌
Drag/drop image import	✅	Uses Memory data	❌
Vocabulary entry	✅	Uses Memory data	✅ via Teacher Panel
Fullscreen activity mode	✅	✅	✅ card view
Card flip animation	✅	✅	N/A
Match detection	✅	❌	N/A
Move counter	✅	❌	N/A
Match counter	✅	❌	N/A
Peek/reveal all cards	✅	Step-based reveal	Show answer
Draggable cards	❌	✅	❌
Auto-shuffle / auto-wash	❌	✅	Reshuffle current card
Auto play	❌	❌	✅
Persistent settings	❌	❌	✅ localStorage
Teacher controls	Vocabulary entry	Same as Memory setup	✅ modal panel
Keyboard shortcuts	Partial form navigation	Pointer driven	✅
---
Architecture
The suite is implemented as a single HTML document containing:
```text
Unified_Memory_Scramble.html
├── <head>
│   ├── Metadata
│   ├── Google Fonts import
│   └── Embedded CSS for all apps
├── <body>
│   ├── App switcher
│   ├── Memory Game app
│   │   ├── Setup/upload panel
│   │   ├── Fullscreen memory board
│   │   ├── Casino shuffle board
│   │   └── Confetti canvas
│   ├── Scramble Cards app
│   │   ├── Student card interface
│   │   ├── Teacher control modal
│   │   └── Toast notification
│   └── Embedded JavaScript
│       ├── App switcher controller
│       ├── Memory Game IIFE
│       └── Scramble Cards IIFE
```
Architectural Pattern
The JavaScript is organized into immediately invoked function expressions (IIFEs), separating the Memory Game and Scramble Cards logic while sharing the same browser document. This avoids global namespace pollution except for a small optional debug exposure: `window._vocabApp`.
Runtime Dependencies
The application depends primarily on standard browser APIs:
DOM APIs.
FileReader API.
Clipboard paste events.
Drag and Drop API.
Pointer Events API.
Canvas 2D API for confetti.
`localStorage` for Scramble Cards persistence.
CSS transitions, transforms, grid, flexbox, and media queries.
---
User Experience and Workflows
Switching Apps
At the top of the viewport, the app provides a fixed switcher with two buttons:
Memory Game
Scramble Cards
The active button updates visually. Switching between apps changes the display state of `#memoryApp` and `#scrambleApp`.
Typical Classroom Flow
Memory Game Flow
Open `Unified_Memory_Scramble.html` in a browser.
Ensure Memory Game is selected.
Upload, drag/drop, or paste images.
Type a vocabulary word for each image.
Optionally shuffle or clear the uploaded list.
Click Play Memory.
Students take turns selecting cards.
The game tracks moves and matches.
When all pairs are matched, confetti is displayed.
Casino Shuffle Flow
Prepare image/vocabulary pairs in Memory Game.
Click Casino Shuffle.
Cards appear face-up with images and vocabulary.
Click a card once to flip it face-down.
Drag cards around manually or click Auto-Wash.
Click a face-down card to focus it.
Click the focused card again to reveal it and trigger celebration.
Scramble Cards Flow
Switch to Scramble Cards.
Show students a scrambled word or phrase.
Click Show Answer or press Enter to reveal.
Click Next, Prev, or use keyboard shortcuts.
Use Reshuffle to generate a new scramble for the current item.
Use Auto Play to cycle through words automatically.
Teachers can open the ⚙️ panel to edit dictionary and difficulty.
---
Memory Game App
Purpose
The Memory Game app allows a teacher to create a vocabulary matching game from custom images. Each uploaded image is paired with a text vocabulary term. The game then generates two cards for each pair:
One image card.
One text card.
Students must match image cards with their corresponding word cards.
Setup Panel
The Memory setup panel contains:
Choose Images file input.
Shuffle button for uploaded pairs.
Clear button for resetting uploaded pairs.
Pairs count pill.
Casino Shuffle launch button.
Play Memory launch button.
Uploaded image/vocabulary list.
User hint text.
Image Input Methods
The app supports three image ingestion methods:
File picker using `input[type="file"]` with `accept="image/*"` and `multiple`.
Clipboard paste for pasted image files, useful with screenshot tools.
Drag/drop onto the page while Memory Game is active.
Only files whose MIME type starts with `image/` are accepted.
Pair Model
Each uploaded image becomes an object similar to:
```js
{
  id: "generated-id",
  imgData: "data:image/...;base64,...",
  vocab: "teacher-entered word"
}
```
Start Conditions
The Play Memory and Casino Shuffle buttons are enabled only when:
At least one image pair exists.
Every uploaded image has a non-empty vocabulary value.
Game Card Generation
When Memory mode starts, the app generates two cards per pair:
```js
cards.push({ pairId: p.id, kind: 'image', content: p.imgData });
cards.push({ pairId: p.id, kind: 'text', content: p.vocab });
```
The combined card list is then shuffled.
Match Logic
A valid match occurs when:
Two cards share the same `pairId`.
The two cards are different kinds: one `image`, one `text`.
The game tracks:
Moves — increments every time two cards are selected.
Matches — increments on valid image/text pair match.
Total pairs — equal to the number of uploaded image/vocabulary pairs.
Board Locking
The board uses a `locked` state to prevent clicks while two non-matching cards are temporarily visible or while animations are in progress.
Peek Cards
The Peek Cards button flips all cards temporarily, waits approximately two seconds, then hides unmatched cards again.
Reset Game
The Reset Game button confirms restart and regenerates/shuffles the board from the current pairs.
Exit Memory
The Exit Memory button hides the fullscreen board and resets the current game state.
Dynamic Grid Sizing
The Memory board calculates an approximate square grid:
```js
const cols = Math.ceil(Math.sqrt(total));
const rows = Math.ceil(total / cols);
```
Card dimensions are dynamically calculated using available container width and height, card gap, aspect ratio, and max card width.
Key sizing constants:
Constant	Value	Purpose
`CARD_GAP`	`12`	Space between cards
`CONTAINER_PADDING`	`24`	Effective layout padding
`CARD_ASPECT_RATIO`	`3/4`	Card width-to-height ratio
`MAX_CARD_WIDTH`	`200`	Maximum card width in pixels
---
Casino Shuffle Mode
Purpose
Casino Shuffle is a secondary interactive activity built from the same Memory Game image/vocabulary pairs. It simulates physical cards that can be flipped, focused, revealed, dragged, and automatically washed/shuffled around the screen.
Card States
Each Casino card uses a `data-state` attribute:
State	Meaning	Visual Behavior
`initial`	Card starts face-up	Image and vocabulary visible
`flipped`	Card is face-down	Back face visible
`focused`	Selected face-down card	Enlarged/focused with accent outline
`revealed`	Revealed card	Enlarged with success outline; triggers confetti
Click State Machine
Casino cards follow this interaction cycle:
```text
initial → flipped → focused → revealed → flipped
```
Drag Behavior
Casino mode uses pointer events for mouse/touch-friendly dragging:
`pointerdown` selects a card.
Movement beyond a small threshold becomes dragging.
`pointermove` updates position and applies rotation based on horizontal movement.
`pointerup` either finishes dragging or treats the action as a click.
Cards are constrained mostly inside the viewport while still allowing a playful partial off-screen layout.
Auto-Wash
The Auto-Wash button randomly repositions and rotates every Casino card with a smooth transition.
---
Scramble Cards App
Purpose
Scramble Cards is a classroom word/phrase practice tool. It displays a scrambled version of the current item and allows the teacher or students to reveal the answer.
Default Dictionary
The app ships with a default word/phrase list:
```text
I'm sorry, thank you, Good Bye, Sing, Run, Like, Bear, Dog,
Swim, Sing, Cat, Boy, Girl, One, Two, Three, Four, Five,
Six, Seven, Eight, Nine, Ten, Pencil, Cap, Flower
```
> Note: `Sing` appears twice in the default dictionary.
Student Controls
The Scramble Cards interface includes:
Show Answer / Hide Answer
Next
Prev
Reshuffle
Auto Play
Current progress counter, for example `1 / 27`
Friendly theme colors that rotate by card index
Auto Play
When Auto Play is enabled:
The button text changes to Stop.
Cards advance every `3500ms`.
Clicking again stops the interval and restores the label to Auto Play.
Theme Rotation
The card container rotates through three visual themes based on index:
`theme-0`
`theme-1`
`theme-2`
---
Teacher Control Panel
Access
The teacher panel is opened with the discreet ⚙️ button in the top-right corner of the Scramble Cards app.
Capabilities
The panel allows teachers to:
Select scramble difficulty.
Add new words or phrases.
Remove words from the dictionary.
Reset to default dictionary and easy difficulty.
Save and apply settings.
Difficulty Modes
Difficulty	Behavior
Easy	Keeps the first and last letters for longer words and shuffles the middle letters. For very short words, swaps letters.
Medium	Keeps the first letter and shuffles the remaining letters.
Hard	Fully shuffles all alphabetic letters in the token.
Dictionary Validation
The teacher cannot save an empty dictionary. If all words are removed, the app alerts:
```text
Dictionary cannot be empty. Please add at least one word.
```
Persistence
Saved teacher settings are written to browser local storage under these keys:
Key	Value
`scramble_words_v2`	JSON array of words/phrases
`scramble_diff_v2`	Selected difficulty: `easy`, `medium`, or `hard`
---
Technical Design
HTML Structure
The document defines two main application roots:
```html
<div id="memoryApp">...</div>
<div id="scrambleApp" style="display: none;">...</div>
```
The app switcher toggles these containers by setting inline `display` styles.
CSS Design System
The file uses CSS custom properties for theming.
Memory Theme Variables
```css
--bg-1: #0b1020;
--bg-2: #071028;
--glass: rgba(255,255,255,0.04);
--muted: #9aa7c7;
--accent: #6be7ff;
--accent-2: #7a5cff;
--neon: linear-gradient(90deg,var(--accent),var(--accent-2));
```
Scramble Theme Variables
```css
--scr-bg:#fff7e6;
--scr-card1:#ffd6a5;
--scr-card2:#ffd3e0;
--scr-card3:#cfe8ff;
--scr-accent:#ff6f61;
--scr-accent-dark:#ff3b2e;
--scr-text:#2b2b2b;
--scr-muted:#6b6b6b;
```
JavaScript Modules
The script area is divided into:
App Switcher Logic
Memory Game Logic
Scramble Game Logic
The Memory and Scramble modules are enclosed in separate IIFEs.
Important Helper Functions
Shared Conceptual Helpers
Function	Area	Purpose
`uid()`	Memory	Generates lightweight random identifiers
`readFileAsDataURL(file)`	Memory	Converts image files to base64 data URLs
`shuffle(arr)` / `shuffleArray(arr)`	Both	Randomizes arrays
`escapeHtml(s)`	Memory/Casino	Escapes vocabulary before injecting into HTML
`celebrate()`	Memory/Casino	Displays canvas confetti
Memory-Specific Functions
Function	Purpose
`handleFiles(fileList)`	Accepts image files from input, paste, or drop
`renderPairs()`	Renders uploaded images and vocabulary fields
`updateStartState()`	Enables/disables start buttons
`renderMemoryGame()`	Builds the card grid
`adjustGridScale()`	Resizes cards to fit viewport
`onMemoryCardClick(e)`	Handles match selection logic
`resetGame()`	Clears current memory state
Scramble-Specific Functions
Function	Purpose
`loadState()`	Loads saved Scramble dictionary/difficulty
`saveState(newWords, newDiff)`	Persists teacher settings
`updateHint()`	Displays difficulty guidance
`scrambleToken(token, difficulty)`	Scrambles a single token
`scramblePhrase(phrase, difficulty)`	Scrambles a phrase token-by-token
`ensureScrambled(original, difficulty)`	Ensures output differs when possible
`renderCard()`	Updates current Scramble card
`openTeacherPanel()`	Initializes teacher modal temp state
`renderWordList()`	Renders editable dictionary list
---
State Management
Memory Game State
Memory state is stored in JavaScript variables and is not persisted after page reload.
```js
let pairs = [];      // Uploaded image/vocabulary pairs
let gameState = null;
```
A typical `gameState` object contains:
```js
{
  cards: [],
  flipped: [],
  matches: 0,
  moves: 0,
  startTime: Date.now(),
  locked: false
}
```
Casino State
Casino mode uses DOM state attributes and runtime variables:
```js
let casinoMaxZ = 100;
let draggedCard = null;
let dragStartX = 0;
let dragStartY = 0;
let cardInitLeft = 0;
let cardInitTop = 0;
let dragHasMoved = false;
```
Scramble Cards State
Scramble state includes runtime values and persisted settings:
```js
let words = [];
let currentDifficulty = 'easy';
let index = 0;
let currentScramble = '';
let autoPlay = false;
let autoTimer = null;
```
Teacher modal edits are staged before save:
```js
let tempWords = [];
let tempDifficulty = 'easy';
```
---
Data Storage and Privacy
Memory Game Data
Memory Game image data is held in browser memory as base64 data URLs.
Not uploaded to a server.
Not persisted to local storage.
Lost when the page reloads or the tab closes.
May consume significant browser memory for large images.
Scramble Cards Data
Scramble dictionary and difficulty are saved in browser `localStorage`.
Storage is local to the browser/profile/device.
Data persists across reloads.
Data is not synchronized unless the browser/profile has external sync outside this app.
Clearing browser site data removes saved settings.
Privacy Summary
Data Type	Stored Where	Sent to Network?	Persistence
Uploaded images	JavaScript memory as data URLs	No app-initiated upload	Current session only
Memory vocabulary	JavaScript memory	No	Current session only
Scramble dictionary	`localStorage`	No	Persistent until cleared
Scramble difficulty	`localStorage`	No	Persistent until cleared
---
Accessibility
The application includes several accessibility-oriented features:
Main Memory app container uses `role="application"` and `aria-label="Vocabulary Memory Game"`.
Setup panel uses `aria-labelledby`.
File input has an accessible label.
Uploaded vocabulary inputs receive per-image `aria-label` values.
Pair list uses `aria-live="polite"` and `aria-atomic="true"`.
Memory board uses `role="grid"` and `aria-label="Game board"`.
Scramble panel uses `role="region"` and `aria-label="ESL Scramble Card"`.
Scrambled text uses `aria-live="polite"`.
Answer visibility updates `aria-hidden`.
Show Answer button updates `aria-pressed`.
Teacher modal updates `aria-hidden`.
Accessibility Gaps to Consider
For enterprise-grade accessibility, the following improvements are recommended:
Add full keyboard interaction for Memory cards.
Add focus trapping inside the teacher modal.
Add Escape key handling for modal close.
Add visible focus outlines for all interactive controls.
Add semantic modal roles such as `role="dialog"` and `aria-modal="true"`.
Add reduced-motion support via `prefers-reduced-motion`.
Add better alt text support for teacher-uploaded images.
---
Responsive Design
The application uses responsive layout techniques including:
`max-width` containers.
CSS grid and flexbox.
`clamp()` for Scramble text sizing.
Media queries for smaller devices.
Dynamic Memory board card resizing calculated from viewport dimensions.
Memory Board Responsiveness
Memory cards are resized to fit the visible board area while preserving a 3:4 aspect ratio.
Scramble Card Responsiveness
For screens under `520px`, Scramble Cards reduces text sizes, panel padding, and button sizing.
---
Performance Characteristics
Strengths
No framework overhead.
CSS-driven animations.
Minimal persistent storage.
No backend round trips.
RequestAnimationFrame used for resize recalculation.
Canvas confetti is short-lived and automatically clears.
Potential Performance Constraints
Large uploaded images are converted to base64 and stored in memory.
Many uploaded pairs can create many DOM nodes and large images.
Card animations and shadows may be heavier on low-power devices.
Auto-Wash and confetti use animation and may impact low-end hardware.
Recommended Operational Limits
For smooth classroom use, prefer:
4–16 image pairs for Memory Game.
Optimized images below 1–2 MB each.
Modern Chromium, Edge, Chrome, Safari, or Firefox browsers.
Laptop/tablet projection rather than very low-end mobile devices.
---
Browser Compatibility
The application uses modern browser features. Recommended browsers:
Microsoft Edge current stable.
Google Chrome current stable.
Mozilla Firefox current stable.
Safari current stable.
Required Browser Capabilities
Capability	Used For
FileReader API	Reading uploaded images
Data URLs	Storing previewable image data in memory
Clipboard file paste	Pasting screenshots/images
Drag and Drop API	Image drop import
Pointer Events	Casino card dragging
Canvas 2D	Confetti animation
localStorage	Scramble settings persistence
CSS Grid/Flex	Layout
CSS transforms/transitions	Card animations
CSS `:has()`	Selected difficulty label styling
> Note: CSS `:has()` is used for the difficulty toggle styling. Older browsers that do not support `:has()` may still function but may not show the selected difficulty style correctly.
---
Runtime and Deployment Model
Runtime
This is a static browser app. It does not need:
Node.js.
npm.
A backend API.
A database.
A bundler.
A build pipeline.
Deployment Options
You can deploy or distribute the app by:
Opening the HTML file directly from disk.
Hosting it on a static web server.
Publishing it through an LMS or classroom portal.
Hosting in SharePoint, OneDrive static preview, GitHub Pages, Azure Static Web Apps, or similar static hosting.
External Dependency Notice
The document imports the Baloo 2 font from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&display=swap" rel="stylesheet">
```
If the app is used offline or in an environment where Google Fonts is blocked, the browser falls back to local/system fonts.
---
Installation and Usage
Local Use
Download or place `Unified_Memory_Scramble.html` on a computer.
Double-click the file or open it in a modern browser.
Use the app switcher to select Memory Game or Scramble Cards.
Static Hosting
Serve the file from any static web server:
```bash
python -m http.server 8000
```
Then open:
```text
http://localhost:8000/Unified_Memory_Scramble.html
```
Classroom Projection Tips
Use browser fullscreen mode for cleaner projection.
Prepare Memory images before class if possible.
Use smaller image files for faster setup.
Use Casino Shuffle for quick reveal games.
Use Scramble Cards Auto Play for warm-up drills.
---
Configuration Reference
Memory Game Constants
Defined inside the Memory Game module:
```js
const CONFIG = {
  CARD_GAP: 12,
  CONTAINER_PADDING: 24,
  CARD_ASPECT_RATIO: 3/4,
  MAX_CARD_WIDTH: 200
};
```
Scramble Auto Play Interval
```js
autoTimer = setInterval(() => {
  index = (index + 1) % words.length;
  renderCard();
}, 3500);
```
Local Storage Keys
```text
scramble_words_v2
scramble_diff_v2
```
Confetti Duration
The confetti animation runs for approximately `3200ms`.
---
Keyboard and Interaction Reference
Memory Game Setup
Action	Interaction
Move to next vocabulary input	Press `Enter` in a vocabulary field
Add images	File picker, paste image, or drag/drop image files
Shuffle uploaded list	Click Shuffle
Clear uploaded list	Click Clear
Memory Board
Action	Interaction
Flip card	Click card
Peek cards	Click Peek Cards
Reset game	Click Reset Game
Exit board	Click Exit Memory
Casino Shuffle
Action	Interaction
Flip initial card face-down	Click card
Focus face-down card	Click flipped card
Reveal focused card	Click focused card
Return revealed card to face-down	Click revealed card
Move card	Drag card
Randomly reposition cards	Click Auto-Wash
Exit mode	Click Exit Casino
Scramble Cards
Action	Keyboard / Button
Next card	`Space`, `ArrowRight`, or Next
Previous card	`ArrowLeft` or Prev
Show/hide answer	`Enter` or Show Answer
Reshuffle current card	Reshuffle
Auto cycle cards	Auto Play
---
Security Considerations
Current Safeguards
Vocabulary rendered in Memory/Casino HTML is escaped using `escapeHtml()` before insertion into card markup.
Scramble word list items are rendered using `textContent`, reducing injection risk.
The app does not intentionally upload user images or vocabulary.
The app does not call backend services.
Important Caveats
Uploaded images are embedded as data URLs and displayed in the page. Very large files may affect memory usage.
The application uses inline scripts and styles. Strict enterprise Content Security Policy (CSP) environments may block execution unless configured.
Google Fonts is loaded from an external domain. Offline/locked-down deployments should self-host fonts or remove the dependency.
`localStorage` is not encrypted and should not be used for sensitive information.
Enterprise Security Recommendations
For controlled enterprise or school deployment:
Self-host fonts or remove external font dependency.
Add a CSP-compatible build by moving CSS and JS into separate files and avoiding inline script/style.
Add file size validation for uploaded images.
Add image count limits.
Add optional image compression before storing data URLs.
Add a privacy notice for teachers if used with student-created content.
Avoid storing personal or sensitive data in Scramble dictionary entries.
---
Known Limitations
Memory Game is not persistent. Uploaded images and vocabulary are lost on refresh.
No import/export. Teachers cannot currently save or reload Memory decks.
No backend or authentication. This is intentional for simplicity but limits centralized management.
No scoring history. Moves and matches are session-only.
Limited keyboard support for Memory cards. Memory gameplay is click/touch-oriented.
No image compression. Large uploaded images can increase memory usage.
Google Fonts dependency. The app still works without it, but typography changes.
Scramble algorithm is alphabetic-English oriented. It primarily detects `[A-Za-z]`, so non-Latin languages may not scramble as expected.
CSS selector issues exist in a few nested styles. Some selectors such as `.word-item #scrambleApp .remove-btn` appear overly specific and may not apply as intended.
No automated tests. The current implementation is manual-test oriented.
---
Quality Assurance Checklist
Memory Game
[ ] Upload one image and enter vocabulary.
[ ] Upload multiple images and verify pair count.
[ ] Paste an image from clipboard.
[ ] Drag/drop image files onto the page.
[ ] Confirm Play Memory remains disabled until all terms are entered.
[ ] Start Memory mode and verify two cards per pair.
[ ] Verify match only occurs between same pair ID and different card kinds.
[ ] Verify move counter increments after two cards.
[ ] Verify matched cards stay face-up.
[ ] Verify non-matches flip back after delay.
[ ] Verify confetti appears after all matches.
[ ] Verify Peek Cards reveals temporarily.
[ ] Verify Reset Game reshuffles and resets counters.
[ ] Verify Exit Memory returns to setup.
Casino Shuffle
[ ] Confirm button is disabled until all vocabulary entries are complete.
[ ] Launch Casino mode.
[ ] Verify cards start face-up.
[ ] Click through `initial → flipped → focused → revealed → flipped`.
[ ] Drag cards with mouse or touch.
[ ] Click Auto-Wash and verify cards reposition.
[ ] Verify confetti appears on reveal.
[ ] Verify Exit Casino closes mode.
Scramble Cards
[ ] Verify default words load on first use.
[ ] Verify answer reveal/hide.
[ ] Verify Next/Prev navigation wraps around.
[ ] Verify Reshuffle changes current scramble when possible.
[ ] Verify Auto Play advances every 3.5 seconds.
[ ] Verify keyboard shortcuts.
[ ] Open teacher panel.
[ ] Add a new word.
[ ] Remove a word.
[ ] Change difficulty.
[ ] Save and reload page to verify persistence.
[ ] Reset defaults.
[ ] Attempt to save an empty dictionary and verify alert.
---
Troubleshooting
Images do not upload
Confirm the file is an image with a MIME type beginning with `image/`.
Try a smaller file.
Use the file picker if drag/drop is blocked by the browser or host environment.
Play Memory / Casino Shuffle is disabled
Ensure every uploaded image has a vocabulary value.
Empty or whitespace-only vocabulary entries do not count.
Scramble settings disappeared
Browser site data or local storage may have been cleared.
A different browser/profile/device may be in use.
Private/InPrivate mode may clear storage after the session.
App looks different offline
Google Fonts may not load offline.
The browser will use fallback fonts.
Performance is slow
Reduce the number of image pairs.
Use smaller/compressed images.
Close other browser tabs.
Avoid very high-resolution images from modern phones unless resized.
---
Recommended Enterprise Improvements
The current app is highly usable as a standalone classroom tool. For enterprise-scale deployment, consider the following roadmap.
Priority 1 — Maintainability
Split the single HTML file into:
`index.html`
`styles.css`
`memory.js`
`scramble.js`
`shared.js`
Add linting and formatting.
Add version metadata.
Add changelog.
Add automated tests for scramble and match logic.
Priority 2 — Data Portability
Add export/import for Memory decks.
Add export/import for Scramble dictionaries.
Add JSON schema validation.
Add a downloadable classroom activity pack format.
Priority 3 — Accessibility and Inclusion
Add complete keyboard navigation for Memory and Casino cards.
Add focus management and modal trapping.
Add reduced-motion mode.
Add teacher-provided alt text for images.
Improve support for non-Latin scripts.
Priority 4 — Security and Governance
Remove inline JavaScript and inline styles for stronger CSP compatibility.
Self-host external fonts.
Add image type and size validation.
Add privacy and acceptable-use guidance.
Add optional admin configuration for locked default dictionaries.
Priority 5 — Classroom Features
Add timer mode.
Add teams and scoring.
Add sound effects with mute control.
Add deck templates.
Add randomized student turn picker.
Add printable vocabulary list.
Add teacher notes.
---
Project Structure
Current structure:
```text
.
├── Unified_Memory_Scramble.html
└── README.md
```
Recommended future structure:
```text
.
├── index.html
├── README.md
├── CHANGELOG.md
├── LICENSE
├── assets/
│   └── fonts/
├── css/
│   ├── base.css
│   ├── memory.css
│   └── scramble.css
├── js/
│   ├── app-switcher.js
│   ├── memory-game.js
│   ├── casino-shuffle.js
│   ├── scramble-cards.js
│   └── shared.js
└── tests/
    ├── memory-game.test.js
    └── scramble-cards.test.js
```
---
Maintenance Notes
Safe Areas to Modify
Default Scramble word list.
CSS custom property colors.
Memory card sizing constants.
Auto Play timing.
Confetti colors and duration.
UI labels and hints.
Areas Requiring Care
Card matching logic.
FileReader/data URL handling.
Casino pointer event handling.
`localStorage` key names.
HTML injection points.
App switcher display state.
Suggested Versioning
Use semantic versioning if the app will be distributed:
```text
MAJOR.MINOR.PATCH
```
Example:
```text
1.0.0 - Initial single-file classroom release
1.1.0 - Add import/export dictionaries
1.1.1 - Fix accessibility labels
```
---
License
No license information is embedded in the provided source file. Add a license before public or enterprise distribution.
Recommended options:
MIT for permissive open-source distribution.
Apache-2.0 for permissive use with explicit patent language.
Proprietary/internal license for private school or organization deployment.
---
Summary
`Unified_Memory_Scramble.html` is a polished, single-file educational suite for classroom vocabulary practice. It includes a custom image-based Memory Game, a draggable Casino Shuffle reveal mode, and a persistent teacher-configurable Scramble Cards app. Its browser-only design makes it simple to distribute and run, while its current architecture remains approachable for future expansion into a more modular, enterprise-managed learning tool.
