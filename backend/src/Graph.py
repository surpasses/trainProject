import heapq

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
        print('node doesnt exist')
        return None

    def getEdges(self, name):
        if name in self.nodes:
            return self.nodes[name].getNeighbours()
    
    
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
    

    # Returns tuple contoniang the distance and list of station in string form
    def dijkstra(self, from_node, to_node):
        if from_node not in self.nodes and to_node not in self.nodes:
            return 
        
        dist = { node: float('infinity') for node in self.nodes }
        prev = { node: -1 for node in self.nodes }

        dist[from_node] = 0
        priority_queue = [(0, from_node)]

        
        while priority_queue:
            current_dist, current_node = heapq.heappop(priority_queue)
            if current_dist > dist[current_node]:
                continue

            # check neighbours
            for neighbour in self.getEdges(current_node):
                distance = current_dist + self.nodes[neighbour].getDistance(current_node)

                # Only consider this new path if it's better than any path we've
                # previously found.
                if distance < dist[neighbour]:
                    dist[neighbour] = distance
                    prev[neighbour] = current_node
                    heapq.heappush(priority_queue, (distance, neighbour))
        
        # gets the list of visited stations in the shortest path
        list = [to_node]
        station = to_node
        while station != from_node:
            station = prev[station]
            list.append(station)


        return (dist[to_node], list)

        



