from geopy.distance import geodesic 

class Node:
    def __init__(self, name, location):
        self.name = name
        self.location = location
        self.adjacent = {}  
        self.lines = set()


    def addLine(self, line):
        self.lines.add(line)
    
    def checkLine(self, line):
        if line in self.lines:
            return True
        return False

    # checks whether a node is a neighbour
    def isAdjacent(self, node):
        if node in self.adjacent:
            return True
        return False

    def addAdjacent(self, node):
        distance = geodesic(self.location, node.location).km
        self.adjacent[node] = distance

    def getName(self):
        return self.name

    def __str__(self):
        return f"{self.name} at coordinates ({self.location[0]}, {self.location[1]})"
