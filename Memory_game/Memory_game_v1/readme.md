🧠 Futuristic Vocabulary Memory

An immersive, interactive vocabulary building and memory game wrapped in a sleek, futuristic glassmorphism UI. Create custom study decks by pairing your own images with vocabulary words, and test your memory using two highly engaging game modes.

✨ Features

🛠️ Custom Deck Creation

Seamless Media Uploads: Add images via the "Choose Images" button, Drag & Drop files directly onto the app, or seamlessly paste images directly from your clipboard (e.g., using Snipping Tool).

Instant Vocabulary Mapping: Easily type and assign vocabulary words to your uploaded images.

Smart Board Generation: The app dynamically pairs your images with your text into shuffled decks for gameplay.

🎮 Two Unique Game Modes

Classic Memory Board

A traditional, grid-based matching game.

Flip cards to find the matching Image ↔ Vocabulary Word pairs.

Features a built-in move counter, match tracker, and 3D card flip animations.

Casino Shuffle Mode

A physics-based, free-form interactive card table.

Cards are dealt face-down onto the screen. Use your mouse or touchscreen to physically drag, throw, and sort cards.

Features an "Auto-Wash" button that visually scrambles the deck across the table.

Click cards to focus on them, and click again to reveal the underlying vocabulary/image pair.

🎨 Modern UI & Animations

Futuristic Aesthetic: Built using CSS variables for a consistent dark theme featuring neon accents, ambient background gradients, and frosted glass elements (glassmorphism).

Fluid Animations: Hardware-accelerated CSS transitions for 3D card flips, hover states, and smooth drag-and-drop physics.

Celebration Effects: Includes a custom, lightweight HTML5 <canvas> confetti animation when a game is successfully completed.

🚀 How to Use

Because this application is built entirely using vanilla web technologies and contained within a single file, setup is instantaneous.

Installation

Save the code into a single file named index.html.

Double-click the file to open it in any modern web browser (Chrome, Firefox, Safari, Edge).

No local server, node modules, or build steps required!

Playing the Game

Upload: Drag and drop images onto the main panel, or paste them from your clipboard.

Assign: Type the corresponding vocabulary word next to each image thumbnail. Press Enter to quickly jump to the next input.

Play: * Click Play Memory to start a standard matching game.

Click Casino Shuffle to try the physics-based interactive study table.

Clear/Restart: Use the "Clear" button to wipe your current deck and start fresh.

💻 Technical Stack

This project was built focusing on maximum portability and zero dependencies.

HTML5: Semantic structure and accessibility (ARIA roles).

CSS3: Advanced styling including CSS Grid, Flexbox, backdrop-filter, 3D transforms (preserve-3d, rotateY), and custom properties.

Vanilla JavaScript (ES6+): * FileReader API for converting uploaded images into base64 Data URLs for local rendering.

Pointer Events API for handling unified touch and mouse physics in the Casino mode.

HTML5 <canvas> API for custom particle rendering (confetti).

📱 Browser Support & Accessibility

Fully responsive design that adapts from mobile screens up to ultra-wide desktop monitors.

Touch-action controls implemented specifically to prevent mobile scrolling while dragging cards in Casino Mode.

Accessible setup with aria-labels, aria-live regions, and keyboard-friendly focus trapping on inputs.

📜 License

This project is open-source and available under the MIT License. Feel free to modify, distribute, and use it for your personal or educational projects.
