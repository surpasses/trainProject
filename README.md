# NSW Train Network Route Visualizer

An interactive route finder for the NSW Train & Metro network. Uses Dijkstra's and A* algorithms to find the shortest path between stations, with a full screen map visualisation detailing the stations selected and the distance between them.

## Tech Stack

- **Frontend**: React.js + Tailwind CSS + Konva (canvas rendering)
- **Backend**: Flask (Python)
- **Database**: MongoDB

## Features

- Full-screen interactive map of NSW train network
- Click-to-select stations (no forms needed)
- Real-time shortest path calculation
- Support for both Dijkstra and A* algorithms
- Train line color coding (T1-T9 + Metro)
- Pan and zoom navigation

## Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the project root with your MongoDB connection string:
   ```
   MONGO_DB_KEY=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```

5. Start the backend server:
   ```bash
   python app.py
   ```
   The API will be available at `http://localhost:5100`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create a `.env` file to customize the API URL:
   ```
   VITE_API_BASE=http://localhost:5100/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## Environment Variables

### Backend (`.env` in project root)
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_DB_KEY` | MongoDB connection string | Yes |

### Frontend (`.env` in frontend/)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE` | Backend API URL | `http://localhost:5100/api` |

## Usage

1. Open the app in your browser
2. Click on any station to select it as the **start point** (green)
3. Click another station to select it as the **destination** (blue)
4. The route will automatically calculate and display
5. View the route details in the top-left panel
6. Click the X to clear and start a new search

## Data Sources

Station location data is sourced from **Transport for NSW Open Data Hub**:

- **Dataset**: Train Station Entrances
- **Resource ID**: `257179b0-aa8c-4172-8d76-9c77a1941a68`
- **URL**: https://opendata.transport.nsw.gov.au/
- **License**: [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)

This data includes latitude and longitude coordinates for all NSW train station entrances and is provided by Transport for NSW under their Open Data policy.

## License

MIT
