import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import data.apiClient as apiClient

from Node import Node
from Graph import Graph
from src.Railway import createNetwork
from database import getStations

# before introducting database
# graph = Graph()
# stations = apiClient.fetchData()
# print(stations)
# createNetwork(graph, stations)

# after introducing database
graph = Graph()
stations = getStations()
createNetwork(graph, stations)

# # stations is a list containing {
#     'Newcastle Interchange': (-32.9239171, 151.7593884),
# # }

