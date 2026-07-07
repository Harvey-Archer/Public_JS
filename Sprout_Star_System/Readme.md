
# 🌱 Sprout Star System – Classroom Dashboard

**Version 15** | A comprehensive, offline-first classroom management dashboard built into a single HTML file.

Sprout combines behavior tracking, multi-class management, time management, student grouping, gamification, and session analytics into a beautiful glassmorphism-inspired interface. Zero setup required—just open in any modern browser.

---

## ✨ Core Features

### 👥 Multi-Class Management
* **Multiple Classes Support:** Create, switch between, and manage multiple classes independently. Each class maintains its own roster, groups, and session history.
* **Class Tabs Navigation:** Quick tab-based switching between your active classes.
* **Class Deletion:** Safely delete individual classes without affecting others.

### 👤 Student & Behavior Management
* **Interactive Star System:** Gamify participation! Clicking "+ Add" drops a star onto the student's card using a custom-built 2D physics engine with realistic gravity, friction, and pile-stacking simulation.
* **Attendance Tracking:** Mark students as absent to visually dim their cards, lock their controls, and automatically exclude them from random pickers and group activities.
* **Live Roster Editing:** 
  - Double-click any student's name to edit inline
  - Click the emoji to cycle through unique avatar icons
  - Editable group titles in Group Builder
  - Customizable quick link labels in the sidebar
* **Transaction Ledger:** Complete audit trail of every star awarded or removed. Open the Ledger modal to view chronological history and click "Undo" to instantly revert any transaction.
* **Card Menu System:** Three-dot menu on each card provides quick access to absence toggle, removal, and other actions.

### 🎲 Advanced Grouping & Picking Tools
* **Group Builder Workspace:** Full-featured drag-and-drop interface for organizing students:
  - Manually drag students from the bench into groups
  - Right-click context menu for precise student movement
  - **Randomize Groups:** Instantly shuffle the class into a specified number of balanced teams
  - Color-coded group cards with customizable titles
  - Delete individual groups with one click
* **Group Rewards:** Award stars to an entire group simultaneously—the physics engine animates stars falling for all group members.
* **Random Picker (Student Selector):** Engaging slot-machine-style picker with:
  - Visual animation during selection
  - Automatic history tracking to prevent repeat picks in the same session
  - Direct star awards from the picker stage
  - Excludes absent students automatically

### ⏱️ Teacher Utilities
* **3D Gatekeeper Security:** Flip-card animation locks the dashboard behind a 4-digit PIN. Perfect for when you step away from the smartboard. First-time setup prompts PIN creation.
* **Smart Classroom Timer:** Feature-rich timer widget:
  - Custom duration input (any time value)
  - Preset buttons for common intervals (35min, 90min)
  - Visual progress bar with gradient fill
  - Play/Pause/Reset controls
  - Real-time status indicators (Running, Paused, Complete)
  - Auto-saves session snapshots when timer completes
* **Daily Agenda Widget:** Tilted sticky-note style scratchpad for daily objectives, homework, or reminders. Content persists across sessions.
* **Quick Links Portal:** Four customizable shortcut buttons to external resources (LMS, YouTube, timers, etc.) with editable labels.
* **Collapsible Side Menu:** Pin-open or slide-out navigation panel containing all major actions and utilities.

### 📊 Session Analytics & History
* **Automatic Session Snapshots:** When the timer completes (or manual save), captures full class state including:
  - Timestamp and session reason
  - Attendance rate percentage
  - Total stars per student
  - Session MVP (top performer)
* **Session History Viewer:** Browse all past sessions with:
  - Visual bar graphs showing individual student performance
  - Trend indicators (↗ increased, ↘ decreased, → stable vs. previous session)
  - Absent students shown in grayscale
  - Filter by date range
  - Manual session entry for retroactive logging
* **Leaderboard View:** Aggregate ranking view showing cumulative student performance across all sessions.
* **Session Export:** Download any historical session as a high-resolution PNG screenshot (requires internet for html2canvas library).

### 💾 Data Portability
* **Full Class Export:** Download complete class data (students, groups, settings) as a `.json` backup file.
* **Drag & Drop Import:** Restore a class by dragging the `.json` file anywhere onto the dashboard. Automatic validation and error handling.
* **Partial Export:** Export only the currently active class (useful for sharing specific rosters).
* **Auto-Backup Prompts:** Toast notifications remind users to export before potential data-loss events.

---

## 🎨 UI/UX Highlights

* **Glassmorphism Design:** Frosted-glass cards with backdrop blur, subtle shadows, and smooth hover animations.
* **Responsive Layout:** Adapts to various screen sizes with comfortable scrolling margins.
* **Visual Feedback:** 
  - Last-active student card highlighting
  - Toast notifications for all major actions
  - Smooth fade-in/slide-up card animations
  - Progress indicators for timers and imports
* **Accessibility:** Keyboard navigation support, focus-visible outlines, and semantic HTML structure.
* **Ocean Green Accent Theme:** Consistent color palette (#1abc9c, #2e8b57) throughout interactive elements.

---

## 🚀 How to Use

**No installation, servers, or databases required.**

1. **Download:** Save `Starter_Star_System_v15.html` to your computer (rename if desired, e.g., `sprout.html`).
2. **Launch:** Double-click to open in Chrome, Edge, Firefox, or Safari.
3. **Initial Setup:**
   - Set your 4-digit Gatekeeper PIN on first launch
   - Configure initial session duration
   - Start adding students via the side menu
4. **Daily Workflow:**
   - Unlock dashboard with PIN
   - Take attendance (mark absent students)
   - Run timer for class activities
   - Award stars for participation
   - Save session at end of class
5. **Ongoing Management:**
   - Export class backups regularly
   - Review session history and leaderboards
   - Reorganize groups as needed

**Internet Requirement:** Only needed for the "Export Snapshot" feature (loads `html2canvas` from CDN). All other features work completely offline.

---

## 🔒 Data & Privacy

**100% Local & Private:**
- All data stored in browser's `localStorage` under a unique key
- No external databases, cloud services, or telemetry
- Data never leaves your device unless you explicitly export
- PIN security stored separately in `localStorage`

**⚠️ Important:** Data is browser-specific. Clearing browser cache/cookies will erase all class data. **Always export backups** before:
- Clearing browser data
- Switching browsers/devices
- Major system updates

Use the **"Export Class"** button in the side menu to create regular backups.

---

## 🛠️ Technical Specifications

| Category | Details |
|----------|---------|
| **File Format** | Single-file HTML (6,400+ lines) |
| **CSS Features** | CSS Variables, Grid/Flexbox, `backdrop-filter`, CSS Animations, Keyframes, Media Queries |
| **JavaScript** | Vanilla ES6+, no frameworks or build tools |
| **Physics Engine** | Custom 2D particle simulator (`PileSim` class) with sub-stepping, collision detection, and velocity damping |
| **Storage** | `localStorage` API with JSON serialization |
| **External Deps** | `html2canvas` (CDN, optional, snapshot export only) |
| **Browser Support** | Modern browsers with ES6, Dialog, and localStorage support |

### Architecture Highlights
- **State Management:** Centralized `state` object with DOM scraping for persistence
- **Physics Isolation:** Per-card simulation instances managed via WeakMap
- **Modal System:** Native `<dialog>` elements with custom backdrop styling
- **Event Delegation:** Efficient handler attachment for dynamic content
- **Migration Support:** Legacy data conversion for backward compatibility

---

## 📝 Version History

**v15 (Current)**
- Pixel-locked rigidity for Picker UI
- Exhaustive architectural decoupling for Delete Class routine
- Complete associative memory cleanup (DOM tabs, pool state, class data)

**Earlier Versions**
- Multi-class support architecture
- 3D Gatekeeper security system
- PileSim physics engine integration
- Session history and leaderboard analytics
- Drag-and-drop import/export
- Group Builder workspace

---

## 📄 License

MIT License – Free for educational and commercial use.

---

## 🙋 Troubleshooting

| Issue | Solution |
|-------|----------|
| Data disappeared after refresh | Check if browser cleared localStorage; import from backup |
| Stars not animating | Ensure browser supports Canvas and requestAnimationFrame |
| Can't unlock dashboard | Reset by clearing `sprout_security_pin` from browser storage (erases security only) |
| Export Snapshot fails | Verify internet connection for html2canvas CDN; try alternative browser |
| Import fails | Validate JSON file structure; ensure file wasn't corrupted during transfer |

---

**Built with ❤️ for educators** | No frameworks, no tracking, no compromises.
