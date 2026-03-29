
# 🌱 Sprout: The All-In-One Classroom Dashboard

Sprout is a comprehensive, offline-first classroom management dashboard built into a single HTML file. Designed for teachers, it seamlessly combines behavior tracking, time management, student grouping, and gamification into a beautiful, glassmorphism-inspired interface.

---

## ✨ Core Features

### 👤 Student & Behavior Management
* **Interactive Star System:** Gamify participation! Clicking "+ Add" drops a star onto the student's card using a custom-built 2D physics engine.
* **Attendance Tracking:** Mark students as absent to visually dim their cards, lock their controls, and exclude them from random pickers.
* **Live Roster Editing:** Double-click any student's name to edit it on the fly, or swap out their avatar emoji.
* **Transaction Ledger:** Made a mistake? Open the Ledger to see a chronological history of every star given or removed, and click "Undo" to instantly revert it.

### 🎲 Advanced Grouping & Picking Tools
* **Group Builder Workspace:** A dedicated interface to manually organize students into color-coded groups, or use the **Randomize** button to instantly shuffle the class into a specific number of teams.
* **Group Rewards:** Award stars to an entire group with a single click.
* **Random Picker (Slot Machine):** An engaging, animated student caller. It keeps a history of who has already been picked to ensure fair participation and allows you to award stars directly from the stage.

### ⏱️ Teacher Utilities
* **3D Gatekeeper Security:** Lock your dashboard behind a 4-digit PIN when you step away from the smartboard.
* **Smart Classroom Timer:** Includes presets for 35-minute and 90-minute blocks, complete with visual progress bars, pause functionality, and audio cues for breaks and session completion.
* **Daily Portals & Agenda:** A built-in scratchpad for daily focuses/homework, alongside quick links to your LMS, YouTube, or scheduling tools.

### 📊 Analytics & Data Portability
* **Session History & Leaderboard:** Every time the timer completes (or you manually save), the app takes a snapshot of the class. It tracks the Session MVP, attendance rate, and individual student trends (↗/↘).
* **Snapshot Export:** Export any historical session as a high-resolution PNG image directly to your computer.
* **Frictionless Import/Export:** Export your entire class roster and groups as a `.json` file. To load your class on a different computer, simply drag and drop the `.json` file anywhere onto the Sprout dashboard.

---

## 🚀 How to Use

Sprout requires absolutely no installation, servers, or database setups.

1. **Save:** Copy the source code and save it to your computer as an `index.html` file (e.g., `sprout.html`).
2. **Launch:** Double-click the file to open it in Google Chrome, Microsoft Edge, Safari, or Firefox.
3. **Setup:** On first launch, the Gatekeeper will ask you to set a 4-digit PIN. Once inside, use the sidebar to start adding students or import an existing `.json` roster.

*Note: An active internet connection is only required if you use the "Export Snapshot" feature, as it loads the `html2canvas` library from a secure CDN.*

---

## 🔒 Data & Privacy

**100% Local Storage:** Sprout is heavily privacy-focused. It does not use external databases or cloud servers. All of your student names, group configurations, and session histories are saved locally directly within your web browser's `localStorage`. Your data never leaves your device. 

*Tip: Because data is tied to your specific browser, clearing your browser's cache/cookies will erase your class data. Make it a habit to use the "Export Class" feature in the sidebar to keep safe backups!*

---

## 💻 Technical Stack

* **Structure:** Single-file HTML5 & CSS3.
* **Styling:** CSS Variables, Grid/Flexbox layouts, CSS animations, and `backdrop-filter` for the frosted-glass aesthetic.
* **Logic:** Vanilla JavaScript (ES6+).
* **Physics:** A custom-written, lightweight 2D particle physics engine handles the gravity, friction, and collision of the visual stars.
