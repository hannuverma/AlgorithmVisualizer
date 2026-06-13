# Algorithm Visualizer - Backend

The backend service for the Algorithm Visualizer project, built with FastAPI. It handles complex algorithmic computations and provides data via a RESTful API to the frontend.

## Tech Stack
- **Language**: Python 3.13+
- **Framework**: FastAPI
- **Dependency Management**: pip / uv

## Getting Started

### Prerequisites
- Python 3.13 or higher

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     .venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source .venv/bin/activate
     ```

4. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Development Server

Start the FastAPI server from the `backend` directory. If you are using FastAPI's CLI:
```bash
fastapi dev app/main.py
```
*(Alternatively, you can run it via `uvicorn app.main:app --reload` depending on your setup)*

The API will be available at `http://localhost:8000`.
You can view the interactive API documentation (Swagger UI) at `http://localhost:8000/docs`.

## Project Structure
- `app/api/`: API routers and endpoints
- `app/core/`: Application configuration and settings
- `app/engine/`: Core algorithmic logic
- `app/schemas/`: Pydantic models for data validation
- `app/main.py`: FastAPI application instance
