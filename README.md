# Vibes: Interactive Pendulum Simulation

Vibes is a web-based interactive simulation for single and double pendulums. Adjust gravity, friction, and rod lengths, and drag the balls to set initial conditions. Watch the pendulum(s) swing and explore chaotic motion in double mode!

## Features
- **Single and Double Pendulum Modes**: Toggle between classic and chaotic motion.
- **Live Data**: Real-time display of position, velocity, and angles for each ball.
- **Adjustable Parameters**:
  - Gravity (g)
  - Friction (damping)
  - Length of each rod (Length 1, Length 2)
- **Drag-and-Drop**: Grab and move either ball to set initial conditions.
- **Responsive Canvas**: Clean, modern UI with live animation.

## Getting Started

### Prerequisites
- [Python 3.x](https://www.python.org/) (for backend static file server)
- [Node.js](https://nodejs.org/) (optional, for other static servers)
- [Git](https://git-scm.com/)

### Running Locally
1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/vibes.git
   cd vibes
   ```
2. **Start the backend (FastAPI static server):**
   ```sh
   cd backend
   # Install dependencies if needed (FastAPI, Uvicorn)
   pip install fastapi uvicorn
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
3. **Open the app:**
   - Go to [http://localhost:8000](http://localhost:8000) in your browser.

#### Or use any static file server:
- Serve the `frontend` directory with [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) (VS Code extension) or `python -m http.server`.

## Project Structure
```
vibes/
  backend/         # FastAPI static server (optional)
  frontend/        # All HTML, JS, CSS for the simulation
  docker-compose.yml (legacy, not needed for frontend-only)
  README.md
  .gitignore
```

## License
MIT 