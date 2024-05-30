class Graph:
    def __init__(self):
        self.nodes = {}

    def add_node(self, node):
        if node.name not in self.nodes:
            self.nodes[node.name] = node

    def add_edge(self, from_node, to_node, weight):
        if from_node in self.nodes and to_node in self.nodes:
            self.nodes[from_node].add_adjacent(self.nodes[to_node], weight)

    def display_graph(self):
        for node in self.nodes.values():
            print(node)
            for adj, weight in node.adjacent.items():
                print(f"  -> {adj} with weight {weight}")