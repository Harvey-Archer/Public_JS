# i-Teacher Timer V3

A lightweight, always-on-top classroom timer built for **AutoHotkey v2**. It runs structured lesson plans as a sequence of timed sections, helping you focus on teaching rather than managing the clock.

## 🚀 Quick Start

1. Ensure **[AutoHotkey v2](https://www.autohotkey.com/)** is installed.
2. Keep `i-Teacher_Timer_V3.ahk` and the `lessons` folder in the same directory.
3. Double-click `i-Teacher_Timer_V3.ahk` to launch.
4. Select a lesson plan (`.txt`) from the `lessons` folder.
5. Press **F8** to start the timer!

## ⌨️ Keyboard Shortcuts

- **F8**: Start / Pause the timer
- **F9**: Skip to the next section
- **F10**: Add 2 minutes to the current section
- **F11**: Remove 2 minutes from the current section
- **F12**: End the lesson early
- **Ctrl + Alt + R**: Restart the current section
- **Ctrl + Alt + H**: Show / Hide the timer HUD
- **Ctrl + Alt + C**: Toggle click-through mode (useful when placing the timer over interactive smartboard apps)
- **Ctrl + Alt + O**: Open a new lesson plan

*(These options are also accessible by right-clicking the app icon in the Windows system tray).*

## 📝 Creating Lesson Plans

Lesson plans are simple `.txt` files located in the `lessons` folder. They must be saved using **UTF-8 encoding**. 

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

## ✨ What's New in V3
- **Dynamic Auto-Scaling Typography:** Multi-line activity names scale perfectly to fit the UI without clipping.
- **Vertical Progress Rail:** A sleek, non-intrusive progress indicator.
- **Robust UTF-8 Parsing:** Full support for smart quotes, em-dashes, and special characters.
- **Interactive UI Elements:** Dedicated info (`ⓘ`) and close (`⨂`) buttons with built-in click safety margins.

## 📄 License
MIT License. See the `LICENSE` file for details.