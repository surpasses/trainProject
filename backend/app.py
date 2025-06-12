from flask import Flask, jsonify
from flask_cors import CORS 
from src.database import getStations

app = Flask(__name__)
CORS(app)
port = 5100

@app.route('/api/stations')
def stations():
    return jsonify(getStations())

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=port)