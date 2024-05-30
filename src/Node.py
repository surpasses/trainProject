class Node:
    def __init__(self, name, location):
        self.name = name
        self.latitude = location[0]
        self.longitude = location[1]
        self.adjacent = {}  

    def addAdjacent(self, node, weight):
        self.adjacent[node] = weight

    def __str__(self):
        return f"{self.name} at coordinates ({self.latitude}, {self.longitude})"
