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

    def addAdjacent(self, node):
        distance = geodesic(self.location, node.location).km
        self.adjacent[node] = distance

    def __str__(self):
        return f"{self.name} at coordinates ({self.location[0]}, {self.location[1]})"
