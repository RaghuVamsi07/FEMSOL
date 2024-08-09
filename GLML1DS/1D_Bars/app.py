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

@app.route('/')
def index():
    if 'session_id' not in request.cookies:
        session_id = str(uuid.uuid4())
        session['id'] = session_id
        resp = make_response(render_template('1D_Bars.html'))
        resp.set_cookie('session_id', session_id)
        return resp
    else:
        session_id = request.cookies.get('session_id')
        session['id'] = session_id
        return render_template('1D_Bars.html')

@app.route('/add-line', methods=['POST'])
def add_line():
    data = request.json
    session_id = request.cookies.get('session_id')
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "INSERT INTO lines_table (x1, y1, x2, y2, session_id) VALUES (%s, %s, %s, %s, %s)"
    values = (data['x1'], data['y1'], data['x2'], data['y2'], session_id)
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
    query = "DELETE FROM lines_table WHERE id=%s AND session_id=%s"
    values = (line_id, session_id)
    cursor.execute(query, values)
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

# Route to get all lines (irrespective of session_id) if needed
@app.route('/get-all-lines', methods=['GET'])
def get_all_lines():
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM lines_table"
    cursor.execute(query)
    lines = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(lines)

# Route to get a specific line by its ID
@app.route('/get-line/<int:line_id>', methods=['GET'])
def get_line(line_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM lines_table WHERE id=%s"
    cursor.execute(query, (line_id,))
    line_data = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify(line_data)

@app.route('/add-force', methods=['POST'])
def add_force():
    try:
        data = request.get_json()  # Safely get JSON data
        line_id = data.get('line_id')
        x1 = data.get('x1')
        y1 = data.get('y1')
        x2 = data.get('x2')
        y2 = data.get('y2')
        fx = data.get('fx')
        fy = data.get('fy')
        x = data.get('x')
        y = data.get('y')

        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO forces_table (line_id, x1, y1, x2, y2, fx, fy, x, y)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (line_id, x1, y1, x2, y2, fx, fy, x, y))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"status": "success"})
    except Exception as e:
        print("Error:", str(e))  # Log the error on the server for debugging
        return jsonify({"status": "error", "message": str(e)}), 500



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
