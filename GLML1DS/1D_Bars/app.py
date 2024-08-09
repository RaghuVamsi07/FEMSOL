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

@app.route('/update-row-numbers', methods=['POST'])
def update_row_numbers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SET @row_number = 0;")
    cursor.execute("""
        UPDATE lines_table 
        SET row_num = (@row_number := @row_number + 1)
        WHERE session_id = %s
        ORDER BY id;
    """, (session['id'],))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
