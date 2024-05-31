from Node import Node
from Graph import Graph
from enum import Enum
from src.Station import initStations

class Line(Enum):
    T1 = 1
    T2 = 2
    T3 = 3
    T4 = 4
    T5 = 5
    T6 = 6
    T7 = 7
    T8 = 8
    T9 = 9
    M = 10

def addEdges(g, route, line):
    prev_s = None
    for s in route:
        g.updateLine(s, line)
        if prev_s is not None:
            g.addEdge(prev_s, s)
            g.addEdge(s, prev_s)
        
        prev_s = s

def createT9Line(g):
    route = ["Normanhurst", "Thornleigh", "Pennant Hills", "Beecroft", "Cheltenham", "Epping",
            "Eastwood", "Denistone", "West Ryde", "Meadowbank", "Rhodes", "Concord West", "North Strathfield", "Strathfield", "Burwood",
            "Redfern", "Central", "Town Hall", "Wynyard", "Milsons Point", "North Sydney", "Waverton", "Wollstonecraft", "St Leonards",
            "Artarmon", "Chatswood", "Roseville", "Lindfield", "Killara", "Gordon"]
    
    addEdges(g, route, Line.T9)



def createT8Line(g):
    route = ["Macarthur", "Campbelltown", "Leumeah", "Minto", "Ingleburn", "Macquarie Fields",
            "Glenfield", "Holsworthy", "East Hills", "Panania", "Revesby", "Padstow", "Riverwood",
            "Narwee", "Beverly Hills", "Kingsgrove", "Bexley North", "Bardwell Park", "Turrella", "Wolli", "International", "Domestic",
            "Mascot", "Green Square", "Central", "Museum", "St James", "Circular Quay", "Wynyard", "Town Hall", "Central", "Redfern", "Erskineville",
             "St Peters", "Sydenham", "Turrella"
    ]
            
    addEdges(g, route, Line.T8)


def createT7Line(g):
    route = ["Olympic Park", "Lidcombe"]

    addEdges(g, route, Line.T7)

def createT5Line(g):
    route = ["Richmond", "East Richmond", "Clarendon", "Windsor", "Mulgrave", "Vineyard",
            "Riverstone", "Schofields", "Quakers Hill", "Marayong", "Blacktown", "Seven Hills", "Toongabbie",
            "Pendle Hill", "Wentworthville", "Westmead", "Parramatta", "Harris Park", "Merrylands", "Guildford", "Yennora", "Fairfield",
            "Canley Vale", "Cabramatta", "Warwick Farm", "Liverpool", "Casula", "Glenfield", "Edmondson Park", "Leppington"]
    
    addEdges(g, route, Line.T5)

def createT4Line(g):
    route = ["Waterfall", "Heathcote", "Engadine", "Loftus", "Sutherland", "Jannali",
            "Como", "Oatley", "Mortdale", "Mortdale", "Penshurst", "Hurstville", "Allawah",
            "Carlton", "Kogarah", "Rockdale", "Banksia", "Arncliffe", "Wolli", "Tempe", "Sydenham", "Redfern", "Central", "Town Hall",
            "Martin Place", "Kings Cross", "Edgecliff", "Bondi Junction"]
    
    route2 = [ "Sutherland", "Kirrawee", "Gymea", "Miranda", "Caringbah", "Woolooware", "Cronulla"]
    
    addEdges(g, route, Line.T4)
    addEdges(g, route2, Line.T4)

def createT3Line(g):
    route = ["Liverpool", "Warwick Farm", "Cabramatta", "Carramar", "Villawood", "Leightonfield", "Chester Hill", "Sefton", "Birrong",
            "Yagoona", "Bankstown", "Punchbowl", "Wiley Park", "Lakemba", "Belmore", "Campsie",
            "Canterbury", "Hurlstone Park", "Dulwich Hill", "Marrickville", "Sydenham", "St Peters", "Erskineville", 
            "Redfern", "Central", "Town Hall", "Wynyard", "Circular Quay", "St James",  "Museum", "Central"]
    
    route2 = [ "Birrong", "Regents Park", "Berala", "Lidcombe"]
    
    addEdges(g, route, Line.T3)
    addEdges(g, route2, Line.T3)

def createT2Line(g):
    route = ["Leppington", "Edmondson Park", "Glenfield", "Casula", "Liverpool", "Wariwick Farm",
            "Cabramatta", "Canley Vale", "Fairfield", "Yennora", "Guildford", "Merrylands", "Granville",
            "Clyde", "Auburn", "Lidcombe", "Flemington", "Homebush", "Strathfield", "Burwood", "Croydon", "Ashfield", "Summer Hill", 
            "Lewisham", "Petersham", "Stanmore", "Newtown", "Macdonaldtown", "Redfern", "Central", 
            "Town Hall", "Wynyard", "Circular Quay", "St James",  "Museum", "Central"]
    
    route2 = [ "Granville", "Harris Park", "Parramatta"]
    
    addEdges(g, route, Line.T2)
    addEdges(g, route2, Line.T2)

def createT1Line(g):
    route = ["Richmond", "East Richmond", "Clarendon", "Windsor", "Mulgrave", "Vineyard",
            "Riverstone", "Schofields", "Quakers Hill", "Marayong", "Blacktown", "Seven Hills", "Toongabbie",
            "Pendle Hill", "Wentworthville", "Westmead", "Parramatta", "Harris Park", "Granville", "Clyde", "Auburn",
            "Lidcombe", "Strathfield", "Redfern", "Central", "Town Hall", "Wynyard", "Milsons Point", "North Sydney", 
            "Waverton", "Wollstonecraft", "St Leonards", "Artarmon", "Chatswood", "Roseville", "Lindfield", "Killara", "Gordon",
            "Pymble", "Turramurra", "Warrawee", "Wahroonga", "Waitara", "Hornsby", "Asquith", "Mount Colah", 
            "Mount Kurring-gai", "Berowra"]

    route2 = ["Emu Plains", "Penrith", "Kingswood", "Werrington", "St Marys", "Mount Druitt",
            "Rooty Hill", "Doonside", "Blacktown"]
    

    addEdges(g, route, Line.T1)
    addEdges(g, route2, Line.T1)

def createMetro(g):
    route = ["Tallawong", "Rouse Hill", "Kellyville", "Bella Vista", "Norwest", "Hills Showground",
            "Castle Hill", "Cherrybrook", "Epping", "Macquarie University", "Macquarie Park", "North Ryde", "Chatswood"
    ]
    
    addEdges(g, route, Line.M)


def createNetwork(g, stations):
    initStations(g, stations)
    createT9Line(g)
    createT8Line(g)
    createT7Line(g)
    createT5Line(g)
    createT4Line(g)
    createT3Line(g)
    createT2Line(g)
    createT1Line(g)
    createMetro(g)
    g.displayWhole()
