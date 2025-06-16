from flask import Flask, jsonify
from flask_cors import CORS 
from src.database import getStations
from src.Railway import createNetwork

app = Flask(__name__)
CORS(app)
port = 5100
graph = createNetwork(getStations())
graph_cache = None

@app.route('/api/graph-data')
def get_graph():
    if graph_cache is None:
        nodedata = {}
        for name, location in graph.nodes.items():
            nodedata[name] = {
                    "name": name,
                    "x": location.location[1], "y": location.location[0]
            }

        graphdata = {}
        for name, node_obj in graph.nodes.items():
            graphdata[name] = {neighbour: dist for neighbour, dist in node_obj.getNeighbours().items()}
        
        all_x = [data['x'] for data in nodedata.values()]
        all_y = [data['y'] for data in nodedata.values()]
        bounds = {"minX": min(all_x), "maxX": max(all_x), "minY": min(all_y), "maxY": max(all_y)}

        graph_cache = {"nodedata": nodedata, "graphdata": graphdata, "bounds": bounds}
        return graph_cache

@app.route('/api/stations')
def stations():
    return jsonify(getStations())

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=port)