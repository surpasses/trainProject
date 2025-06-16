import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import data.apiClient as apiClient

from src.Node import Node
from src.Graph import Graph
from src.Railway import createNetwork, findShortestPath
from src.database import getStations

# before introducting database
# graph = Graph()
# stations = apiClient.fetchData()
# print(stations)
# createNetwork(graph, stations)

# after introducing database
stations = getStations()
g = createNetwork(stations)
findShortestPath(g, "Erskineville", "Cabramatta")

# # stations is a list containing {
#     'Newcastle Interchange': (-32.9239171, 151.7593884),
# # }

