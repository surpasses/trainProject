import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import data.apiClient as apiClient

from Node import Node
from Graph import Graph
from createRailway import createNetwork

graph = Graph()
stations = apiClient.fetchData()
createNetwork(graph, stations)

