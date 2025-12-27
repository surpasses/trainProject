import heapq
from math import sqrt

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

    def getEdges(self, name):
        if name in self.nodes:
            return self.nodes[name].getNeighbours()
        return {}
    
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
    
    def _heuristic(self, node1, node2):
        """Calculate Euclidean distance heuristic for A*"""
        loc1 = self.nodes[node1].location
        loc2 = self.nodes[node2].location
        # Euclidean distance (approximate, works well for nearby coordinates)
        return sqrt((loc1[0] - loc2[0])**2 + (loc1[1] - loc2[1])**2) * 111  # ~111km per degree

    # Returns tuple containing the distance and list of stations in string form
    def dijkstra(self, from_node, to_node):
        if from_node not in self.nodes or to_node not in self.nodes:
            return None
        
        dist = { node: float('infinity') for node in self.nodes }
        prev = { node: None for node in self.nodes }

        dist[from_node] = 0
        priority_queue = [(0, from_node)]

        while priority_queue:
            current_dist, current_node = heapq.heappop(priority_queue)
            
            if current_node == to_node:
                break
                
            if current_dist > dist[current_node]:
                continue

            # check neighbours
            edges = self.getEdges(current_node)
            if edges:
                for neighbour, edge_dist in edges.items():
                    distance = current_dist + edge_dist

                    # Only consider this new path if it's better
                    if distance < dist[neighbour]:
                        dist[neighbour] = distance
                        prev[neighbour] = current_node
                        heapq.heappush(priority_queue, (distance, neighbour))
        
        # Build the path
        if prev[to_node] is None and from_node != to_node:
            return None  # No path found
            
        path = []
        station = to_node
        while station is not None:
            path.append(station)
            station = prev[station]
        
        path.reverse()
        return (dist[to_node], path)

    def astar(self, from_node, to_node):
        """A* pathfinding algorithm"""
        if from_node not in self.nodes or to_node not in self.nodes:
            return None
        
        # g_score: cost from start to current node
        g_score = { node: float('infinity') for node in self.nodes }
        # f_score: g_score + heuristic estimate to goal
        f_score = { node: float('infinity') for node in self.nodes }
        prev = { node: None for node in self.nodes }

        g_score[from_node] = 0
        f_score[from_node] = self._heuristic(from_node, to_node)
        
        # Priority queue: (f_score, g_score, node_name)
        # Include g_score for tie-breaking
        priority_queue = [(f_score[from_node], 0, from_node)]
        in_queue = {from_node}

        while priority_queue:
            current_f, current_g, current_node = heapq.heappop(priority_queue)
            in_queue.discard(current_node)
            
            if current_node == to_node:
                break
            
            if current_g > g_score[current_node]:
                continue

            # check neighbours
            edges = self.getEdges(current_node)
            if edges:
                for neighbour, edge_dist in edges.items():
                    tentative_g = g_score[current_node] + edge_dist

                    if tentative_g < g_score[neighbour]:
                        prev[neighbour] = current_node
                        g_score[neighbour] = tentative_g
                        f_score[neighbour] = tentative_g + self._heuristic(neighbour, to_node)
                        
                        if neighbour not in in_queue:
                            heapq.heappush(priority_queue, (f_score[neighbour], tentative_g, neighbour))
                            in_queue.add(neighbour)
        
        # Build the path
        if prev[to_node] is None and from_node != to_node:
            return None  # No path found
            
        path = []
        station = to_node
        while station is not None:
            path.append(station)
            station = prev[station]
        
        path.reverse()
        return (g_score[to_node], path)
