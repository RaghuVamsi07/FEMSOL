from flask import Flask, request, jsonify, render_template, session, make_response
import mysql.connector
import os
from flask_session import Session
import uuid

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

def is_point_on_line(x1, y1, x2, y2, x, y):
    # Check if the point (x, y) is on the line (x1, y1) to (x2, y2)
    distance = abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / ((y2 - y1)**2 + (x2 - x1)**2)**0.5
    line_length = ((x2 - x1)**2 + (y2 - y1)**2)**0.5
    point_to_start = ((x - x1)**2 + (y - y1)**2)**0.5
    point_to_end = ((x - x2)**2 + (y - y2)**2)**0.5
    return distance < 1e-5 and point_to_start <= line_length and point_to_end <= line_length



@app.route('/')
def index():
    # Check if session_id is already in the cookies
    if 'session_id' not in request.cookies:
        # Generate a new session_id if not present
        session_id = str(uuid.uuid4())
        session['id'] = session_id
        resp = make_response(render_template('1D_Bars.html'))
        # Set the session_id as a cookie
        resp.set_cookie('session_id', session_id)
        print(f"New session created: {session_id}")
        return resp
    else:
        # Use the existing session_id
        session_id = request.cookies.get('session_id')
        session['id'] = session_id
        print(f"Existing session found: {session_id}")
        return render_template('1D_Bars.html')

@app.route('/add-line-with-number', methods=['POST'])
def add_line_with_number():
    data = request.json
    session_id = request.cookies.get('session_id')  # Ensure session_id is retrieved correctly
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
    INSERT INTO lines_table (x1, y1, x2, y2, session_id, line_num)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    values = (data['x1'], data['y1'], data['x2'], data['y2'], session_id, data['line_num'])
    cursor.execute(query, values)
    conn.commit()
    line_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return jsonify({'id': line_id})

@app.route('/update-line/<int:line_id>', methods=['PUT'])
def update_line(line_id):
    data = request.json
    session_id = request.cookies.get('session_id')
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "UPDATE lines_table SET x1=%s, y1=%s, x2=%s, y2=%s WHERE id=%s AND session_id=%s"
    values = (data['x1'], data['y1'], data['x2'], data['y2'], line_id, session_id)
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/delete-line/<int:line_id>', methods=['DELETE'])
def delete_line(line_id):
    session_id = request.cookies.get('session_id')
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get the line number of the line to be deleted
    cursor.execute("SELECT line_num FROM lines_table WHERE id=%s AND session_id=%s", (line_id, session_id))
    line_num_result = cursor.fetchone()
    
    if line_num_result:
        line_num = line_num_result[0]

        # Delete the line
        cursor.execute("DELETE FROM lines_table WHERE id=%s AND session_id=%s", (line_id, session_id))
        conn.commit()

        # Update line numbers of remaining lines
        cursor.execute("""
            UPDATE lines_table
            SET line_num = line_num - 1
            WHERE session_id=%s AND line_num > %s
        """, (session_id, line_num))
        conn.commit()

    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})


@app.route('/clear-lines', methods=['POST'])
def clear_lines():
    session_id = request.cookies.get('session_id')
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "DELETE FROM lines_table WHERE session_id=%s"
    cursor.execute(query, (session_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/get-lines', methods=['GET'])
def get_lines():
    session_id = request.cookies.get('session_id')
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT id, x1, y1, x2, y2 FROM lines_table WHERE session_id=%s"
    cursor.execute(query, (session_id,))
    lines = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify([{'id': row[0], 'x1': row[1], 'y1': row[2], 'x2': row[3], 'y2': row[4]} for row in lines])



@app.route('/save-force', methods=['POST'])
def save_force():
    data = request.json
    print('Received data:', data)  # Debug print
    session_id = request.cookies.get('session_id')
    
    # Fetch the line's coordinates based on line_num and session_id
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT x1, y1, x2, y2 FROM lines_table WHERE line_num=%s AND session_id=%s"
    cursor.execute(query, (data['line_num'], session_id))
    line_data = cursor.fetchone()

    if not line_data:
        cursor.close()
        conn.close()
        return jsonify({'status': 'error', 'message': 'Line not found.'}), 400

    x1, y1, x2, y2 = line_data

    # Check if the point (x, y) is on the line
    if not is_point_on_line(x1, y1, x2, y2, data['x'], data['y']):
        cursor.close()
        conn.close()
        return jsonify({'status': 'error', 'message': 'The point is outside the line.'}), 400

    # Insert force data into forces_table
    query = """
    INSERT INTO forces_table (line_num, force_num, x, y, fx, fy, session_id)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(query, (
        data['line_num'], 
        data['force_num'], 
        data['x'], 
        data['y'], 
        data['fx'], 
        data['fy'], 
        session_id
    ))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'status': 'success'})




if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
