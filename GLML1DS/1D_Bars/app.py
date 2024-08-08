import os
from flask import Flask, request, jsonify, render_template, session
from flask_session import Session
import mysql.connector
from mysql.connector import Error

app = Flask(__name__, static_folder='static')

# Secret key for session management
app.secret_key = os.urandom(24)

# Session configuration
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_KEY_PREFIX'] = 'session:'
Session(app)

# Database configuration
db_config = {
    'user': 'femsol',
    'password': 'Dreamsneverdie21',
    'host': 'database-1.c1c8ug44ytox.eu-north-1.rds.amazonaws.com',
    'database': 'femsol_db'
}

# Database connection
def create_connection():
    connection = None
    try:
        connection = mysql.connector.connect(**db_config)
    except Error as e:
        print(f"Error: '{e}'")
    return connection

@app.route('/')
def index():
    return render_template('1D_Bars.html')

@app.route('/get-lines', methods=['GET'])
def get_lines():
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM lines_table")
    lines = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(lines)

@app.route('/add-line', methods=['POST'])
def add_line():
    data = request.json
    connection = create_connection()
    cursor = connection.cursor()
    query = "INSERT INTO lines_table (x1, y1, x2, y2, session_id) VALUES (%s, %s, %s, %s, %s)"
    values = (data['x1'], data['y1'], data['x2'], data['y2'], data['session_id'])
    cursor.execute(query, values)
    connection.commit()
    line_id = cursor.lastrowid
    cursor.close()
    connection.close()
    return jsonify({'id': line_id})

@app.route('/update-line/<int:line_id>', methods=['PUT'])
def update_line(line_id):
    data = request.json
    connection = create_connection()
    cursor = connection.cursor()
    query = "UPDATE lines_table SET x1 = %s, y1 = %s, x2 = %s, y2 = %s WHERE id = %s"
    values = (data['x1'], data['y1'], data['x2'], data['y2'], line_id)
    cursor.execute(query, values)
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({'status': 'success'})

@app.route('/delete-line/<int:line_id>', methods=['DELETE'])
def delete_line(line_id):
    connection = create_connection()
    cursor = connection.cursor()
    query = "DELETE FROM lines_table WHERE id = %s"
    cursor.execute(query, (line_id,))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({'status': 'success'})

@app.route('/clear-lines', methods=['POST'])
def clear_lines():
    data = request.json
    session_id = data.get('session_id', 'default_session')
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM lines_table WHERE session_id = %s", (session_id,))
    cursor.execute("DELETE FROM forces_table WHERE session_id = %s", (session_id,))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({'status': 'success'})

@app.route('/save_force', methods=['POST'])
def save_force():
    data = request.json
    connection = create_connection()
    cursor = connection.cursor()
    query = "INSERT INTO forces_table (session_id, line_id, fx, fy, x, y) VALUES (%s, %s, %s, %s, %s, %s)"
    values = (data['session_id'], data['line_id'], data['fx'], data['fy'], data['x'], data['y'])
    cursor.execute(query, values)
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
