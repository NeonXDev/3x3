# 3x3 Sliding Puzzle Arcade

A retro arcade-style 3x3 sliding tile puzzle game with timer, move counter, and leaderboard.

🎮 **Live Demo:** [https://neonxdev.github.io/3x3/](https://neonxdev.github.io/3x3/)

---

## 🕹️ Features
- **Arcade HUD**: Tracks real-time elapsed time, moves made, and personal best score.
- **Image Presets**: Switch between built-in presets (Puppy, Pug, Retro) or paste any custom image URL.
- **Peek Mode**: Hold **[Space]** at any time to peek at the original solved image.
- **Smooth Controls**: Click tiles to slide them into the empty space, or use the **Arrow Keys** (Up, Down, Left, Right).
- **Leaderboard**:
  - Automatically persists the top 5 scores and best records.
  - Runs 100% client-side via `localStorage` on **GitHub Pages**.
  - Syncs to `scores.json` when running locally with **Flask**.

---

## 🚀 Running Locally

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the game server:
   ```bash
   python app.py
   ```
3. Open your browser at:
   ```
   http://127.0.0.1:5000
   ```

---

## 🌐 GitHub Pages Deployment

The repository is configured to deploy directly to GitHub Pages:
- Static entrypoint: [`index.html`](./index.html)
- GitHub Actions workflow: [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)

To enable GitHub Pages:
1. Go to your repository on GitHub: `https://github.com/NeonXDev/3x3/settings/pages`
2. Under **Build and deployment > Source**, choose either:
   - **GitHub Actions** (recommended, automated via workflow), OR
   - **Deploy from a branch** -> `main` / `/(root)`.
3. The game will be live at `https://neonxdev.github.io/3x3/`.
