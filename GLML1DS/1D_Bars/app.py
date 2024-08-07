from flask import Flask, request, jsonify, render_template
import mysql.connector

app = Flask(__name__, static_folder='static')

# Database configuration
db_config = {
    'user': 'femsol_user',
    'password': 'Dreamsneverdie@21',
    'host': 'your-rds-endpoint',  # Replace with your RDS endpoint
    'database': 'femsol_db'
}

def get_db_connection():
    conn = mysql.connector.connect(**db_config)
    return conn

@app.route('/')
def index():
    return render_template('1D_Bars.html')

@app.route('/results')
def results():
    return render_template('results.html')


@app.route('/add-line', methods=['POST'])
def add_line():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO lines_table (x1, y1, x2, y2, session_id) VALUES (%s, %s, %s, %s, %s)", 
                   (data['x1'], data['y1'], data['x2'], data['y2'], data['session_id']))
    conn.commit()
    line_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return jsonify({'id': line_id})

@app.route('/update-line/<int:line_id>', methods=['PUT'])
def update_line(line_id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE lines_table SET x1 = %s, y1 = %s, x2 = %s, y2 = %s WHERE id = %s",
                   (data['x1'], data['y1'], data['x2'], data['y2'], line_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/delete-line/<int:line_id>', methods=['DELETE'])
def delete_line(line_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM lines_table WHERE id = %s", (line_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/clear-lines', methods=['POST'])
def clear_lines():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM lines_table")
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/get-lines', methods=['GET'])
def get_lines():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, x1, y1, x2, y2 FROM lines_table")
    lines = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify([{'id': line[0], 'x1': line[1], 'y1': line[2], 'x2': line[3], 'y2': line[4]} for line in lines])

if __name__ == "__main__":
    app.run(host='0.0.0.0')
