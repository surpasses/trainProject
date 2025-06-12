import requests

def fetchData():
    """
    extract the latitude and longitude of each train station
    """
    url = 'https://opendata.transport.nsw.gov.au/api/3/action/datastore_search?resource_id=257179b0-aa8c-4172-8d76-9c77a1941a68&limit=1100'
    response = requests.get(url)
    data = response.json()

    checkStation = set()
    stations = {}
    for entry in data['result']['records']:
        if entry['Train_Station'] in checkStation:
            continue

        stations[f"{entry['Train_Station']}"] = (float(entry['LAT']), float(entry['LONG']))
        checkStation.add(entry['Train_Station'])


    return stations

