# i-Teacher Timer V4.5

A lightweight, always-on-top classroom timer built for **AutoHotkey v2**. It runs structured lesson plans as a sequence of timed sections, helping you focus on teaching rather than managing the clock.

## 🚀 Quick Start

1. Ensure **[AutoHotkey v2](https://www.autohotkey.com/)** is installed.
2. Keep `i-Teacher_Timer_V4.5.ahk` and the `lessons` folder in the same directory.
3. Double-click `i-Teacher_Timer_V4.5.ahk` to launch.
4. Select a lesson plan (`.txt`) from the `lessons` folder.
5. Press **F8** to start the timer!

## ⌨️ Keyboard Shortcuts

- **F8**: Start / Pause the timer / Dismiss `@reminder` alert
- **F9**: Skip to the next section (disabled during `@reminder`)
- **F10**: Add 2 minutes to the current section (disabled during `@reminder`)
- **F11**: Remove 2 minutes from the current section (disabled during `@reminder`)
- **F12**: End the lesson early
- **Ctrl + MouseWheel** / **Ctrl + Plus/Minus**: Scale the UI size dynamically
- **Ctrl + Alt + R**: Restart the current section
- **Ctrl + Alt + H**: Show / Hide the timer HUD
- **Ctrl + Alt + C**: Toggle click-through mode (useful when placing the timer over interactive smartboard apps)
- **Ctrl + Alt + O**: Open a new lesson plan

*(These options are also accessible by right-clicking the app icon in the Windows system tray).*

## 📝 Creating Lesson Plans

Lesson plans are simple `.txt` files located in the `lessons` folder. They must be saved using **UTF-8 encoding**. 

### Standard Timed Sections
Use the format `Activity name|minutes` on each line:

```text
# Example Lesson
Greeting & Warm-up|5
Vocabulary Intro|10
[TPR Activities]|15
Break|5
Reading Practice|20
```

- Lines starting with `#` or `;` are ignored (useful for comments).
- Decimals are allowed (e.g., `Quick transition|0.5` creates a 30-second timer).
- The dynamic UI will automatically scale text to fit long activity names gracefully.

### Custom Alerts (@reminder)
You can inject full-screen, non-timed alerts into your lesson plan using the `@reminder:` syntax:

```text
@reminder: Take Attendance
@reminder: Hand out worksheets
```
When the timer reaches a reminder, it pauses the countdown, plays an alert sound, and flashes a red overlay until dismissed with **F8**.

## ✨ What's New in V4.5
- **@reminder Alerts:** Custom text alerts that take over the UI with a red flashing background.
- **Keyboard Zooming:** Scale the UI using `Ctrl + Plus/Minus` globally, alongside the existing hover-gated `Ctrl + MouseWheel`.
- **Advanced Word-Wrap Scaling:** The internal `GetOptimalFontSize` engine now mathematically calculates exact wrapped-text heights and widest-word widths, ensuring text never clips horizontally or vertically.

## 🏗️ Architectural Notes (For Future Development)
If modifying this codebase, be aware of the following structural paradigms introduced in V4.5:

1. **The `isReminder` State Guard:**
   Reminders are injected into the `lesson` array with an `isReminder: true` property and a duration of `0`. Core functions (`Tick()`, `UpdateHUD()`, `Adjust()`, `TogglePause()`) rely on an `isReminder` early-return guard to prevent division-by-zero crashes, timer corruption, and conflicting hotkey states.
2. **UI Z-Order & Flashing Logic:**
   The reminder overlay utilizes two specific controls: `reminderBg` (a Progress control) and `reminderTxt` (a BackgroundTrans Text control). 
   - They must remain the **last** controls added to the GUI to guarantee they render on top of the timer elements.
   - The flashing effect toggles the `Background` option of `reminderBg` rather than the global `hud.BackColor` so the footer (Info/Close buttons) retains its original styling.
   - Because AHK Progress controls paint over transparent text controls when updated, `reminderTxt.Redraw()` is explicitly called during the `FlashReminder` loop to maintain the correct z-order.
3. **Footer Protection:**
   The reminder overlay (`h226` base) is explicitly calculated to stop just above the footer line, leaving `infoTxt`, `closeTxt`, and `statusTxt` visible and interactive at all times as a fallback escape hatch.

## 📄 License
MIT License. See the `LICENSE` file for details.