from flask import Flask, jsonify, request
from flask_cors import CORS 
from src.database import getStations
from src.Railway import createNetwork

app = Flask(__name__)
CORS(app, origins=["https://train-project-six.vercel.app", "http://localhost:5173"])
port = 5100

# Initialize graph once at startup
graph = createNetwork(getStations())
graph_cache = None

@app.route('/api/graph-data')
def get_graph():
    global graph_cache
    if graph_cache is None:
        nodedata = {}
        for name, node_obj in graph.nodes.items():
            nodedata[name] = {
                "name": name,
                "x": node_obj.location[1],  # longitude
                "y": node_obj.location[0],  # latitude
                "lines": list(line.name for line in node_obj.lines)
            }

        graphdata = {}
        for name, node_obj in graph.nodes.items():
            graphdata[name] = {neighbour: dist for neighbour, dist in node_obj.getNeighbours().items()}
        
        all_x = [data['x'] for data in nodedata.values()]
        all_y = [data['y'] for data in nodedata.values()]
        bounds = {
            "minX": min(all_x), 
            "maxX": max(all_x), 
            "minY": min(all_y), 
            "maxY": max(all_y)
        }

        graph_cache = {"nodedata": nodedata, "graphdata": graphdata, "bounds": bounds}
    
    return jsonify(graph_cache)

@app.route('/api/stations')
def stations():
    return jsonify(getStations())

@app.route('/api/route', methods=['POST'])
def find_route():
    """
    Find the shortest route between two stations.
    Request body:
    {
        "from": "Station Name",
        "to": "Station Name",
        "algorithm": "dijkstra" | "astar"
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    from_station = data.get('from')
    to_station = data.get('to')
    algorithm = data.get('algorithm', 'dijkstra')
    
    if not from_station or not to_station:
        return jsonify({"error": "Both 'from' and 'to' stations are required"}), 400
    
    if from_station not in graph.nodes:
        return jsonify({"error": f"Station '{from_station}' not found"}), 404
    
    if to_station not in graph.nodes:
        return jsonify({"error": f"Station '{to_station}' not found"}), 404
    
    # Run the selected algorithm
    if algorithm == 'astar':
        result = graph.astar(from_station, to_station)
    else:
        result = graph.dijkstra(from_station, to_station)
    
    if result is None:
        return jsonify({"error": "No route found between the stations"}), 404
    
    distance, path = result
    
    # Build response with coordinates for each station in path
    path_with_coords = []
    for station_name in path:
        node = graph.nodes[station_name]
        path_with_coords.append({
            "name": station_name,
            "x": node.location[1],  # longitude
            "y": node.location[0],  # latitude
            "lines": list(line.name for line in node.lines)
        })
    
    return jsonify({
        "path": path,
        "pathWithCoords": path_with_coords,
        "distance": round(distance, 2),
        "algorithm": algorithm,
        "stationCount": len(path)
    })

@app.route('/api/station-list')
def station_list():
    """Return a simple list of station names for the dropdown"""
    return jsonify(sorted(list(graph.nodes.keys())))

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=port, debug=True)
