from flask import Flask, jsonify, request
import mysql.connector
import matplotlib.pyplot as plt
import base64
from io import BytesIO
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Database configuration
db_config = {
    'user': 'femsol_user',
    'password': 'Dreamsneverdie@21',
    'host': 'localhost',
    'database': 'femsol_db'
}

def get_db_connection():
    conn = mysql.connector.connect(**db_config)
    return conn

@app.route('/plot-data', methods=['POST'])
def plot_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT x1, y1, x2, y2 FROM lines_table")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        return jsonify({'status': 'error', 'message': 'No data found'}), 404

    plt.figure()
    for row in rows:
        plt.plot([row[0], row[2]], [row[1], row[3]])

    img = BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode()

    return jsonify({'status': 'success', 'plot_url': plot_url})

if __name__ == '__main__':
    app.run(port=5001, debug=True)
