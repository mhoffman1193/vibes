from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Serve static files at /static
frontend_path = os.path.join(os.path.dirname(__file__), '../frontend')
app.mount("/static", StaticFiles(directory=frontend_path), name="static")

# Serve index.html at /
@app.get("/")
async def get_index():
    return FileResponse(os.path.join(frontend_path, "index.html"))