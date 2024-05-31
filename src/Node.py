from geopy.distance import geodesic 

class Node:
    def __init__(self, name, location):
        self.name = name
        self.location = location
        self.adjacent = {}  

    def addAdjacent(self, node, weight):
        distance = geodesic(self.location, node.location).km
        self.adjacent[node] = distance

    def __str__(self):
        return f"{self.name} at coordinates ({self.latitude}, {self.longitude})"
