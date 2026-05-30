# Futuristic Vocabulary Memory Game (v5)

## Overview
The Futuristic Vocabulary Memory Game is an enterprise-grade, single-file web application designed for classroom and pedagogical environments. It allows educators and students to seamlessly pair uploaded images with custom vocabulary words to create a dynamic, highly engaging memory matching experience.

Version 5 represents a major refinement in layout stability, pedagogical usability, and artisanal UI design.

## Key Features

### 1. Dynamic Grid Scaling (No-Scroll Guarantee)
The game board utilizes a sophisticated `adjustGridScale()` algorithm hooked into `requestAnimationFrame`. This ensures the grid of cards dynamically scales down to fit entirely within the available viewport height, strictly preventing layout regressions and vertical scrollbars, regardless of the pair count.

### 2. Pedagogical Sequential Numbering
Designed with classroom management in mind, the back of each card features high-contrast sequential numbering. This allows educators to direct students (e.g., "Flip card #5") without needing to visually count or point.

### 3. Artisanal Card Aesthetics
The card backs feature a premium, casino-quality design:
*   Full-surface coverage using absolute positioning.
*   A sophisticated multi-layered cross-hatch pattern with radial vignettes.
*   A classic serif font (`Georgia`) for the main central number, enhanced with a subtle metallic gradient fill and drop shadow.
*   Corner indices (top-left and bottom-right) mirroring authentic playing card layouts.

### 4. Dual Game Modes
*   **Classic Memory**: A structured, grid-based memory matching game.
*   **Casino Shuffle**: A free-form, drag-and-drop mode with realistic physics and an "Auto-Wash" scrambling feature.

### 5. Responsive Typography
Text cards automatically scale and wrap their content naturally without breaking mid-word, ensuring readability for longer vocabulary terms.

## Technical Architecture
*   **Zero Dependencies**: Pure HTML5, CSS3, and Vanilla JavaScript. No build step or external libraries required.
*   **Performance Optimized**: Utilizes CSS 3D transforms, `requestAnimationFrame` for layout calculations, and lightweight HTML5 Canvas for the celebration confetti.
*   **Accessibility Ready**: Includes ARIA labels (`aria-label`, `aria-live`, `aria-atomic`), semantic HTML, and keyboard navigation support.
*   **Cross-Browser Compatibility**: Standardized CSS Grid and Custom Properties support modern browsers.

## Installation & Usage
1. Download or clone the repository.
2. Open the `v1_fix_scrollbar_numbering_Memory_game_LightMode_v1_diff_v5.html` file directly in any modern web browser (Chrome, Edge, Firefox, Safari). No server required.
3. Use the **Choose Images** button to upload pictures, or drag and drop images directly onto the setup panel.
4. Type the corresponding vocabulary word next to each uploaded image.
5. Click **Play Memory** to begin the structured game, or **Casino Shuffle** for the free-form mode.

## Version History Context (v1 to v5)
*   **v1**: Base implementation and layout fixing.
*   **v2**: Removed diff artifacts, encapsulated grid scaling logic, and centralized magic numbers into `CONFIG`.
*   **v3**: Cleaned up card styles, removed duplicated borders, and refined vocabulary text wrapping (`word-break: normal`).
*   **v4**: Overhauled card backs with artisanal styling, central numbers, and corner indices.
*   **v5**: Fixed card back flexbox constraints, ensuring the premium design covers 100% of the card surface at any zoom level.

---
*Built for robustness, military-level resilience, and enterprise-grade classroom deployment.*