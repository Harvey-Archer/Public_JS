# 🔤 Grade 1 ESL Scramble Cards v2

An interactive, gamified vocabulary practice tool designed specifically for young ESL learners. This single-file web application features a playful UI for students and a hidden control panel for teachers to customize the learning experience on the fly.

---

## ✨ Key Features

### 🎓 Student Experience
* **Dynamic Scrambling:** Automatically scrambles vocabulary words and phrases to test reading and word recognition.
* **Playful UI:** Features a full-viewport, distraction-free interface with soft, color-shifting background themes that rotate as the student progresses.
* **Auto-Play Mode:** Automatically cycles through the vocabulary deck on a timer.
* **Keyboard Navigation:** Fully supports keyboard shortcuts for quick classroom operation.

### ⚙️ Hidden Teacher Control Panel
* **Discreet Access:** A low-opacity gear icon in the top right corner grants access to the settings modal, keeping it out of the way of students.
* **Difficulty Engine:** * **Easy:** Swaps middle letters only, keeping words highly recognizable.
  * **Medium:** Keeps the first letter intact and scrambles the rest.
  * **Hard:** Fully randomizes all letters in the word.
* **Live Dictionary Management:** Add new words, delete old ones, or restore the default Grade 1 vocabulary list directly from the UI.
* **Persistent Storage:** Saves your custom dictionary and difficulty settings to the browser's `localStorage`, ensuring your deck is ready for the next class.

---

## 🚀 How to Use

### 🎮 Playing the Game (Student View)
* **Show/Hide Answer:** Click "Show Answer" to reveal the correctly spelled word.
* **Next / Prev:** Navigate through the deck.
* **Reshuffle:** Generates a new scramble for the current word.
* **Auto Play:** Starts a 3.5-second timer to automatically advance to the next card.
* **Keyboard Shortcuts:**
  * `Spacebar` / `Right Arrow`: Next Card
  * `Left Arrow`: Previous Card
  * `Enter`: Show/Hide Answer

### 🛠️ Managing the Deck (Teacher View)
1. Hover over the top-right corner of the screen and click the **⚙️ (Gear)** icon to open the Teacher Controls.
2. **Change Difficulty:** Select Easy, Medium, or Hard under "Scramble Difficulty".
3. **Add Words:** Type a word or phrase into the input field and click **Add** (or press Enter).
4. **Remove Words:** Click the red **&times;** next to any word in the list to delete it.
5. **Save:** Click **Save & Apply** to update the deck and return to the game.

---

## 💻 Technical Stack

This application is built with a focus on simplicity, requiring zero setup or external dependencies.

* **Architecture:** Single-file HTML application (HTML5, CSS3, ES6 JavaScript).
* **Styling:** CSS Variables for theming, Flexbox for layout, and modern glassmorphism UI techniques for the teacher modal.
* **State Management:** Vanilla JavaScript with HTML5 `localStorage` for offline data persistence.
* **Responsiveness:** Fluid typography (`clamp()`) and adaptive layouts ensure the app looks great on projectors, tablets, and phones.

---

## 📥 Installation

1. Copy the source code.
2. Save it as an `index.html` file on your computer.
3. Double-click the file to open it in Chrome, Edge, Safari, or Firefox. 
*No internet connection or local server is required to run the app.*
