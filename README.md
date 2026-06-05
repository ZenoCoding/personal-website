# Tycho Young - Personal Website

Welcome to my personal portfolio and workspace, built to showcase my projects in software engineering, mechatronics, and artificial intelligence, as well as host interactive multiplayer web experiments.

---

## Sections & Key Features

* **Portfolio Showcase:** Displays my mechatronics, robotics, and software engineering projects (e.g., 6-Axis Robot Arm, Calc3D, Repetition, and EMPATH).
* **Multiplayer Games Room:** Features real-time multiplayer card games (Dou Di Zhu and Wu Shi K) synced across rooms using **PartyKit** WebSocket connections.
* **Student/Robotics Portal:** Interactive lesson planner, quizzes, and resource sheets for FIRST Robotics Team 9470 and local mechatronics students.
* **Photography Log:** A curated gallery of my urban, travel, and robotics photography, complete with details on capture settings and a custom lightbox viewer.
* **Personal Blog:** A markdown-supported blog engine sharing lessons in physics, robotics, and software engineering.

---

## Tech Stack

* **Frontend Framework:** Next.js 16 (React 19 + TypeScript) using App Router
* **Real-time Multiplayer:** PartyKit (`partykit`) + PartySocket (`partysocket`)
* **Syntax Highlighting:** PrismJS (for lesson code blocks)
* **Styling:** Vanilla CSS Modules + custom layout components
* **Icons:** Lucide React

---

## Getting Started

### Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### Running Locally
Start the Next.js development server:
```bash
npm run dev
```

### Deploying the PartyKit Server
Deploy the WebSocket server logic:
```bash
npx partykit deploy
```
