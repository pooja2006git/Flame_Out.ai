
# 🔥 Flame Out.AI – Interactive Vertex-Cover Puzzle Game  
### A strategy game powered by graph theory + AI

<img src="flameout dashboard.jpeg"/>

## 🧠 What is Flame Out.AI?

**Flame Out.AI** is an interactive puzzle game based on the *Vertex Cover Problem* — a famous problem from Graph Theory and AI.

Your objective:
👉 Identify the minimum number of vertices required to disable all fire-nodes (edges).  
Every move changes the graph. Every choice matters.


## 🕹 How to Play

1. You will see a graph — mountains are **circles (nodes)** and fire paths are **lines (edges)**.
2. Click on any mountain (node) to place a **water tank** on it.
3. When you place a tank:
   - All fire paths connected to that mountain get extinguished.
4. Your goal is to **cover every fire path** by placing tanks on the *minimum* number of mountains.
5. When every path is covered, click **"Check Solution"** to see the result.

> Think of it like this:  
> If a fire path touches *at least one* mountain with a water tank, that path cannot burn anymore.


### Visual Explanation (Simple Version)

| You do this | Result |
|-------------|--------|
| 🟢 Click a mountain | ✅ Water tank placed |
| 🔥 Fire path remains red | ❌ Not covered yet |
| 🔵 Path turns grey | ✅ Fire path covered |
| All paths grey | 🎉 You win! You found a vertex cover |

The challenge is:
✔ Not just to stop the fire  
❗ But to stop the fire using the **fewest possible tanks**

> 🟡 *Think strategically — selecting fewer nodes gives you a higher score!*


## 🏆 Game Rules

1. You must choose nodes such that every fire-edge is "covered."
2. You win when all edges are deactivated (turned gray).
3. Lower number of selected nodes = higher score.
4. Every move counts — choose wisely!

> This is a variation of an NP-Hard problem…
> — not brute force �


## ✨ Features

-  Interactive graph rendering
-  Fast frontend with **React + Vite + TailwindCSS**
-  Backend API powered by **Django + PostgreSQL**
-  Stores game attempt history
-  Based on real AI/graph-theory algorithm design


## 🛠 Tech Stack

| Area | Technology |
|------|------------|
| Frontend | React, Vite, TypeScript, TailwindCSS, Lucide Icons |
| Backend | Django REST API |
| Database / Auth | Supabase |
| Deployment | Netlify (Frontend) + Render / Railway (Backend) |




