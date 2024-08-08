from flask import Flask, request, jsonify, render_template, session
import mysql.connector
import os
from flask_session import Session

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

def get_db_connection():
    conn = mysql.connector.connect(**db_config)
    return conn

@app.route('/')
def index():
    session['id'] = request.remote_addr
    return render_template('1D_Bars.html')

@app.route('/results')
def results():
    return render_template('results.html')

@app.route('/add-line', methods=['POST'])
def add_line():
    data = request.json
    session_id = session.get('id', 'default_session')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO lines_table (x1, y1, x2, y2, session_id) VALUES (%s, %s, %s, %s, %s)", 
                   (data['x1'], data['y1'], data['x2'], data['y2'], session_id))
    conn.commit()
    line_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return jsonify({'id': line_id})

@app.route('/update-line/<int:line_id>', methods=['PUT'])
def update_line(line_id):
    data = request.json
    session_id = session.get('id', 'default_session')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE lines_table SET x1 = %s, y1 = %s, x2 = %s, y2 = %s WHERE id = %s AND session_id = %s",
                   (data['x1'], data['y1'], data['x2'], data['y2'], line_id, session_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/delete-line/<int:line_id>', methods=['DELETE'])
def delete_line(line_id):
    session_id = session.get('id', 'default_session')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM lines_table WHERE id = %s AND session_id = %s", (line_id, session_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/clear-lines', methods=['POST'])
def clear_lines():
    session_id = session.get('id', 'default_session')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM lines_table WHERE session_id = %s", (session_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/get-lines', methods=['GET'])
def get_lines():
    session_id = session.get('id', 'default_session')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, x1, y1, x2, y2 FROM lines_table WHERE session_id = %s", (session_id,))
    lines = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify([{'id': line[0], 'x1': line[1], 'y1': line[2], 'x2': line[3], 'y2': line[4]} for line in lines])

@app.route('/add-force', methods=['POST'])
def add_force():
    data = request.json
    session_id = session.get('id', 'default_session')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO forces_table (ip_address, line_id, fx, fy, x, y) VALUES (%s, %s, %s, %s, %s, %s)", 
                   (session_id, data['line_id'], data['fx'], data['fy'], data['x'], data['y']))
    conn.commit()
    force_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return jsonify({'id': force_id})

@app.route('/update-force/<int:force_id>', methods=['PUT'])
def update_force(force_id):
    data = request.json
    session_id = session.get('id', 'default_session')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE forces_table SET fx = %s, fy = %s, x = %s, y = %s WHERE id = %s AND ip_address = %s",
                   (data['fx'], data['fy'], data['x'], data['y'], force_id, session_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/delete-force/<int:force_id>', methods=['DELETE'])
def delete_force(force_id):
    session_id = session.get('id', 'default_session')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM forces_table WHERE id = %s AND ip_address = %s", (force_id, session_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/get-forces', methods=['GET'])
def get_forces():
    session_id = session.get('id', 'default_session')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, line_id, fx, fy, x, y FROM forces_table WHERE ip_address = %s", (session_id,))
    forces = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify([{'id': force[0], 'line_id': force[1], 'fx': force[2], 'fy': force[3], 'x': force[4], 'y': force[5]} for force in forces])

@app.route('/add-distributive-force', methods=['POST'])
def add_distributive_force():
    data = request.json
    session_id = session.get('id', 'default_session')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO distributive_forces_table (ip_address, line_id, start_fx, start_fy, end_fx, end_fy, start_x, start_y, end_x, end_y) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", 
                   (session_id, data['line_id'], data['start_fx'], data['start_fy'], data['end_fx'], data['end_fy'], data['start_x'], data['start_y'], data['end_x'], data['end_y']))
    conn.commit()
    distributive_force_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return jsonify({'id': distributive_force_id})

@app.route('/update-distributive-force/<int:distributive_force_id>', methods=['PUT'])
def update_distributive_force(distributive_force_id):
    data = request.json
    session_id = session.get('id', 'default_session')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE distributive_forces_table SET start_fx = %s, start_fy = %s, end_fx = %s, end_fy = %s, start_x = %s, start_y = %s, end_x = %s, end_y = %s WHERE id = %s AND ip_address = %s",
                   (data['start_fx'], data['start_fy'], data['end_fx'], data['end_fy'], data['start_x'], data['start_y'], data['end_x'], data['end_y'], distributive_force_id, session_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/delete-distributive-force/<int:distributive_force_id>', methods=['DELETE'])
def delete_distributive_force(distributive_force_id):
    session_id = session.get('id', 'default_session')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM distributive_forces_table WHERE id = %s AND ip_address = %s", (distributive_force_id, session_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/get-distributive-forces', methods=['GET'])
def get_distributive_forces():
    session_id = session.get('id', 'default_session')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, line_id, start_fx, start_fy, end_fx, end_fy, start_x, start_y, end_x, end_y FROM distributive_forces_table WHERE ip_address = %s", (session_id,))
    distributive_forces = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify([{'id': df[0], 'line_id': df[1], 'start_fx': df[2], 'start_fy': df[3], 'end_fx': df[4], 'end_fy': df[5], 'start_x': df[6], 'start_y': df[7], 'end_x': df[8], 'end_y': df[9]} for df in distributive_forces])

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
