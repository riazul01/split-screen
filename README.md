# Split Screen

An interactive and dynamic nested screen splitting system built with **React 19**, **TypeScript**, and **Tailwind CSS**.

[Live Preview](https://split-screen-play.vercel.app/)

---

## 🌟 Features

- ✂️ **Dynamic Splitting** — Split any screen vertically (`v`) or horizontally (`h`) with infinite nesting.
- 🔄 **Smart Undo/Remove (`-`)** — Removing a panel automatically collapses parent containers, seamlessly restoring the previous layout.
- ↔️ **Smooth Resizing** — Drag dividers to resize panels with pointer/touch support and adjacent screen color gradient indicators.
- ⌨️ **Keyboard Accessible** — Focus dividers with <kbd>Tab</kbd> and resize using <kbd>Arrow</kbd> keys.
- 🎨 **Rich Palette** — 40+ curated vibrant colors with automatic sibling contrast.

---

## 🎮 Controls

| Action | Control | Description |
| :--- | :---: | :--- |
| **Split Vertically** | <kbd>v</kbd> | Splits current screen side-by-side |
| **Split Horizontally** | <kbd>h</kbd> | Splits current screen top-and-bottom |
| **Remove Screen** | <kbd>-</kbd> | Removes current screen & unwraps container |
| **Resize Panels** | `Drag` / <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> | Adjusts adjacent panel proportions |

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🛠️ Tech Stack

- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Vite**
