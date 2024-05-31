class Graph:
    def __init__(self):
        self.nodes = {}

    def addNode(self, node):
        if node.name not in self.nodes:
            self.nodes[node.name] = node

    def addEdge(self, from_node, to_node):
        if from_node in self.nodes and to_node in self.nodes:
            if not self.nodes[from_node].isAdjacent(to_node):
                self.nodes[from_node].addAdjacent(self.nodes[to_node])
    
    def getNode(self, name):
        if name in self.nodes:
            return self.nodes[name]
        return None
    
    def updateLine(self, node, line):
        if node in self.nodes:
            self.nodes[node].addLine(line)
    
    
    # checks if given station is in the network of a specified line
    def verifyLine(self, name, line):
        node = self.getNode(name)
        if node and node.checkLine(line):
            return True
        return False

    def displayWhole(self):
        for node in self.nodes.values():
            print(node)
            for adj, weight in node.adjacent.items():
                print(f"  -> {adj} with weight {weight}")

    def display(self, line):
        i = 0
        for node in self.nodes.values():
            if not node.checkLine(line):
                continue
            i += 1
            print(node)
            for adj, weight in node.adjacent.items():
                if self.verifyLine(adj.getName(), line):
                    print(f"  -> {adj} with weight {weight}")
        
        print(f"number of stations is {i}")