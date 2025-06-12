import os
from pymongo import MongoClient
from dotenv import load_dotenv 
from .Station import initDbStations
from .data.apiClient import fetchData

load_dotenv()
CONNECTION_STRING = os.getenv('MONGO_DB_KEY')
client = MongoClient(CONNECTION_STRING)

def initDatabase():
    """
    Initialise the database. Create's a collection instance if collection does not exist
    on MongoDB
    """
    if 'transport' not in client.list_database_names():
        database = client['transport']
        collection = database['stations']
        stations = fetchData()
        dbstations = initDbStations(stations)
        collection.insert_many(dbstations)


def getDatabase():
    """
    Fetches the database collection from MongoDB and returns the 'stations' dictionary where:
    key : name,
    value : (longitude, latitude)
    """
    database = client['transport']
    collection = database['stations']

    stations = {}
    for station in collection.find({}):
        stations[station['name']] = (float(station['location'][0]), float(station['location'][1]))

    return stations

def getStations():
    """
    Returns the list of stations from the database where:
    station = {
        key : name,
        value : (longitude, latitude)
    }
    """
    initDatabase()
    return getDatabase()