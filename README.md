# Windows 定时关机 ⏰

A modern Windows shutdown timer application built with **Electron + Vue 3 + TypeScript + Vite**.

## ✨ Features

- ⏱️ **Countdown timer** — set a countdown (hours / minutes / seconds) before shutdown
- ⚡ **Quick presets** — one-click 5 min, 30 min, 1 h, 2 h, 4 h, 8 h shortcuts
- ❌ **Cancel** — abort a scheduled shutdown at any time
- 🖥️ **System tray** — minimizes to tray with quick-access context menu
- 🌙 **Dark / Light theme** — toggle in the title bar
- 📊 **Real-time progress ring** — animated SVG countdown ring

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| [Electron](https://www.electronjs.org/) | Desktop application framework |
| [Vue 3](https://vuejs.org/) | Reactive UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vitejs.dev/) | Ultra-fast build tool with HMR |
| [TailwindCSS](https://tailwindcss.com/) | Utility-first styling |
| [Pinia](https://pinia.vuejs.org/) | State management |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

### Install & Run

```bash
# 1. Clone the repository
git clone https://github.com/Utahamo/windows-shutdown-timer.git
cd windows-shutdown-timer

# 2. Install dependencies
pnpm install

# 3. Start in development mode (hot reload)
pnpm dev

# 4. Package for Windows
pnpm build
```

## 📂 Project Structure

```
windows-shutdown-timer/
├── src/
│   ├── main/                      # Electron main process
│   │   ├── index.ts               # App window, tray, IPC handlers
│   │   ├── preload.ts             # Context-bridge preload script
│   │   └── services/
│   │       └── shutdown.ts        # Windows shutdown command service
│   └── renderer/                  # Vue 3 frontend
│       ├── main.ts                # App entry
│       ├── App.vue                # Root component + title bar
│       ├── components/
│       │   ├── Timer.vue          # SVG countdown ring display
│       │   ├── Controls.vue       # Preset buttons + custom input
│       │   └── ThemeToggle.vue    # Dark/light theme switch
│       ├── stores/
│       │   └── shutdown.ts        # Pinia store (timer logic)
│       ├── styles/
│       │   └── globals.css        # Tailwind + custom component classes
│       └── env.d.ts               # Window.electronAPI type declaration
├── public/
│   └── icon.png                   # Application icon
├── index.html
├── vite.config.ts
├── tsconfig.json                  # Renderer TypeScript config
├── tsconfig.main.json             # Main process TypeScript config
├── tailwind.config.js
├── postcss.config.js
├── electron-builder.json
└── package.json
```

## 📦 Build Output

| File | Description |
|------|-------------|
| `release/*-setup.exe` | NSIS installer |
| `release/*-portable.exe` | Portable executable |

## 🔒 Security

- Context isolation enabled; `nodeIntegration` disabled.
- All system commands run in the main process via IPC — the renderer never calls `child_process` directly.
- Input validation in `ShutdownService` prevents out-of-range values.
