# Vision Document: Memory Game Light Mode Refinements

## Executive Summary
This document outlines the critical refinements required for `Memory_game_LightMode.html` to meet enterprise-grade standards for classroom deployment. The focus is on removing artifacts, fixing layout regressions (scrollbars), and enhancing pedagogical usability (sequential card numbering).

---

## 1. Issue Analysis & Requirements

### 1.1. Artifact Removal (Diff Headers)
**Observation:** 
The rendered application displays raw diff header text at the top of the page:
`--- Memory_game_LightMode.html (原始) +++ Memory_game_LightMode.html (修改后)`
This indicates that during the file creation process, version control metadata or a diff output was accidentally included in the HTML body. Additionally, any Chinese characters (`原始`, `修改后`) must be purged.

**Requirement:**
- Locate and remove the specific HTML node or text content containing these strings.
- Sanitize the file to ensure no non-English instructional text or metadata remains visible to the end-user.
- Ensure the `<body>` tag contains only the intended application structure.

### 1.2. Layout Stability (Vertical Scrollbar Elimination)
**Observation:** 
In "Classic Memory" mode, the game board triggers vertical scrollbars when the grid of cards exceeds the viewport height. This breaks immersion and forces users to scroll to see all cards, which is unacceptable for a fixed-board game experience.

**Requirement:**
- **Constraint:** The game board must *never* induce a vertical scrollbar on the `body` or the main container, regardless of the number of card pairs.
- **Behavior:** The grid must dynamically scale down (shrink card dimensions and gaps) to fit entirely within the available viewport height (`100vh`) minus the UI header/footer space.
- **Responsiveness:** The solution must work for various aspect ratios and card counts (e.g., 6 pairs vs. 20 pairs).

### 1.3. Pedagogical Enhancement (Sequential Card Numbering)
**Observation:** 
Currently, cards are identified only by their image/content. In a classroom setting, a teacher needs to direct a student ("Flip card #5 and card #12") without physically pointing or counting visually.

**Requirement:**
- **Feature:** Overlay a sequential number (1, 2, 3...) on the **back** of every card in the Classic Memory mode.
- **Visibility:** The number must be clearly visible when the card is face-down.
- **Logic:** Numbers must correspond to the visual reading order (left-to-right, top-to-bottom) so the teacher's mental map matches the student's view.
- **Persistence:** Numbers should remain consistent for the duration of the round.

---

## 2. Technical Implementation Strategy

To achieve an enterprise-grade, robust solution, the following technical approaches will be employed:

### 2.1. Sanitization Protocol
- **Action:** Perform a strict DOM audit of the generated HTML string before final write.
- **Method:** Search for regex patterns matching diff headers (`---.*\+\+\+`) and non-ASCII CJK (Chinese-Japanese-Korean) character ranges.
- **Execution:** Remove the offending nodes entirely. Verify that the `<body>` starts directly with the `.app-container` or equivalent root element.

### 2.2. Dynamic Grid Scaling Algorithm (No-Scroll Solution)
Instead of using fixed pixel sizes for cards, we will implement a **CSS Grid + JavaScript Calculation** hybrid approach:

1.  **Container Definition:** The game board will be set to `height: 100%` of its parent, which is constrained to `100vh` minus the height of the static UI bars (header/controls).
2.  **Grid Configuration:** Use `display: grid` with `grid-template-columns: repeat(auto-fit, minmax(...))`.
3.  **Dynamic Sizing Logic (JavaScript):**
    - On game start (and window resize), calculate the `availableHeight` and `availableWidth`.
    - Determine the optimal `cardSize` such that `(rows * cardSize) + (gaps * rowGap) <= availableHeight`.
    - Apply this calculated size via CSS Custom Properties (e.g., `--card-size: 120px`).
4.  **Overflow Protection:** Set `overflow: hidden` on the board container as a fail-safe, ensuring that even if calculation drifts slightly, no scrollbar appears.
5.  **Aspect Ratio:** Maintain a strict aspect ratio for cards (e.g., 2:3) using `aspect-ratio` CSS property to prevent distortion.

### 2.3. Sequential Numbering System
We will inject numbers programmatically during the deck initialization phase:

1.  **Data Structure Extension:** When creating the card objects for the game state, add a `sequenceId` property based on the array index (`index + 1`).
2.  **DOM Injection:**
    - In the card rendering function, create a dedicated `<span class="card-number">` element.
    - Inject this element into the "Card Back" face of the DOM structure.
    - Style it to be centered, bold, high-contrast (dark blue on light gray), and large enough to be read from a distance.
3.  **Accessibility:** Add `aria-label="Card number ${sequenceId}"` to ensure screen readers also announce the number.
4.  **Visual Hierarchy:** Ensure the number does not obscure the decorative pattern but is distinct enough to be the primary identifier when flipped down.

---

## 3. Quality Assurance & Best Practices

- **Code Modularity:** The sizing logic will be encapsulated in a dedicated `adjustGridScale()` function, called on `load` and `resize` events.
- **Performance:** Use `requestAnimationFrame` for resize handlers to prevent layout thrashing.
- **Cross-Browser Compatibility:** Test CSS Grid and Custom Properties support (standard in all modern browsers).
- **Maintainability:** All magic numbers (sizes, gaps) will be moved to CSS variables or configuration constants at the top of the script.
- **Validation:** 
    - Verify zero scrollbars with 4, 8, 12, and 20 pairs.
    - Verify numbers match visual position (Left-Top = 1).
    - Verify no stray text exists in the DOM.

---

## 4. Expected Outcome

Upon completion, `Memory_game_LightMode.html` will be a polished, classroom-ready application:
- **Clean:** No debug text or foreign language artifacts.
- **Stable:** A "single-screen" experience where the entire game board is always visible without scrolling.
- **Usable:** Teachers can efficiently manage the game flow using clear numerical identifiers on card backs.

This plan ensures the application meets professional standards for educational software deployment.
