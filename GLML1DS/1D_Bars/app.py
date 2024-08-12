from flask import Flask, request, jsonify, render_template, session, make_response
import mysql.connector
import os
from flask_session import Session
from math import isclose
from sympy import sympify
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


@app.route('/get-line/<int:line_num>', methods=['GET'])
def get_line(line_num):
    session_id = request.cookies.get('session_id')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT x1, y1, x2, y2 FROM lines_table WHERE line_num=%s AND session_id=%s"
        cursor.execute(query, (line_num, session_id))
        line_data = cursor.fetchone()
        
        cursor.close()
        conn.close()

        if line_data:
            return jsonify({'status': 'success', 'line_data': {'x1': line_data[0], 'y1': line_data[1], 'x2': line_data[2], 'y2': line_data[3]}})
        else:
            return jsonify({'status': 'error', 'message': 'Line not found.'}), 404
    except Exception as e:
        print(f"Error fetching line data: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to fetch line data.'}), 500

@app.route('/save-force', methods=['POST'])
def save_force():
    data = request.json
    session_id = request.cookies.get('session_id')
    
    # Insert force data into forces_table
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
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
    except Exception as e:
        print(f"Error: {e}")  # This will help you debug any issues in the logs
        return jsonify({'status': 'error', 'message': 'Failed to save force data.'}), 500


@app.route('/get-forces', methods=['GET'])
def get_forces():
    session_id = request.cookies.get('session_id')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT force_id, line_num, force_num FROM forces_table WHERE session_id=%s"
        cursor.execute(query, (session_id,))
        forces = cursor.fetchall()
        
        cursor.close()
        conn.close()

        forces_list = [{'force_id': force[0], 'line_num': force[1], 'force_num': force[2]} for force in forces]
        return jsonify({'status': 'success', 'forces': forces_list})
    except Exception as e:
        print(f"Error fetching forces: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to fetch forces.'}), 500


@app.route('/get-force/<int:force_id>', methods=['GET'])
def get_force(force_id):
    session_id = request.cookies.get('session_id')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT line_num, force_num, fx, fy, x, y FROM forces_table WHERE force_id=%s AND session_id=%s"
        cursor.execute(query, (force_id, session_id))
        force_data = cursor.fetchone()
        
        cursor.close()
        conn.close()

        if force_data:
            return jsonify({'status': 'success', 'force_data': {
                'line_num': force_data[0],
                'force_num': force_data[1],
                'fx': force_data[2],
                'fy': force_data[3],
                'x': force_data[4],
                'y': force_data[5]
            }})
        else:
            return jsonify({'status': 'error', 'message': 'Force not found.'}), 404
    except Exception as e:
        print(f"Error fetching force data: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to fetch force data.'}), 500


@app.route('/update-force/<int:force_id>', methods=['PUT'])
def update_force(force_id):
    data = request.json
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        UPDATE forces_table
        SET line_num=%s, force_num=%s, fx=%s, fy=%s, x=%s, y=%s
        WHERE force_id=%s AND session_id=%s
        """
        cursor.execute(query, (
            data['line_num'], 
            data['force_num'], 
            data['fx'], 
            data['fy'], 
            data['x'], 
            data['y'], 
            force_id,
            session_id
        ))
        conn.commit()
        
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error updating force data: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to update force data.'}), 500


@app.route('/delete-force/<int:force_id>', methods=['DELETE'])
def delete_force(force_id):
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "DELETE FROM forces_table WHERE force_id=%s AND session_id=%s"
        cursor.execute(query, (force_id, session_id))
        conn.commit()
        
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error deleting force data: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to delete force data.'}), 500

@app.route('/clear-storage', methods=['POST'])
def clear_storage():
    session_id = request.cookies.get('session_id')
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Clear lines_table
        query_lines = "DELETE FROM lines_table WHERE session_id=%s"
        cursor.execute(query_lines, (session_id,))

        # Clear forces_table
        query_forces = "DELETE FROM forces_table WHERE session_id=%s"
        cursor.execute(query_forces, (session_id,))

        # Clear dist_forces_table
        query_dist_forces = "DELETE FROM dist_forces_table WHERE session_id=%s"
        cursor.execute(query_dist_forces, (session_id,))

        # Clear body forces table
        query_body_forces = "DELETE FROM body_forces_table WHERE session_id=%s"
        cursor.execute(query_body_forces, (session_id,))

       
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error clearing storage: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to clear storage.'}), 500



# Save distributive force data
@app.route('/save-distributive-force', methods=['POST'])
def save_distributive_force():
    data = request.json
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO dist_forces_table (line_num, force_num, force_dist, x1, y1, x2, y2, session_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            data['line_num'],
            data['force_num'],
            data['force_dist'],
            data['x1'],
            data['y1'],
            data['x2'],
            data['y2'],
            session_id
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to save distributive force data.'}), 500


# Get all distributive forces for the session
@app.route('/get-distributive-forces', methods=['GET'])
def get_distributive_forces():
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT dist_for_id, line_num, force_num FROM dist_forces_table WHERE session_id=%s"
        cursor.execute(query, (session_id,))
        forces = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({'status': 'success', 'forces': [{'dist_for_id': f[0], 'line_num': f[1], 'force_num': f[2]} for f in forces]})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to fetch distributive forces.'}), 500


# Get a single distributive force by ID
@app.route('/get-distributive-force/<int:force_id>', methods=['GET'])
def get_distributive_force(force_id):
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT line_num, force_num, force_dist, x1, y1, x2, y2 FROM dist_forces_table WHERE dist_for_id=%s AND session_id=%s"
        cursor.execute(query, (force_id, session_id))
        force_data = cursor.fetchone()
        cursor.close()
        conn.close()

        if force_data:
            return jsonify({'status': 'success', 'force_data': {
                'line_num': force_data[0],
                'force_num': force_data[1],
                'force_dist': force_data[2],
                'x1': force_data[3],
                'y1': force_data[4],
                'x2': force_data[5],
                'y2': force_data[6]
            }})
        else:
            return jsonify({'status': 'error', 'message': 'Distributive force not found.'}), 404
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to fetch distributive force data.'}), 500


# Update a distributive force
@app.route('/update-distributive-force/<int:force_id>', methods=['PUT'])
def update_distributive_force(force_id):
    data = request.json
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        UPDATE dist_forces_table
        SET line_num=%s, force_num=%s, force_dist=%s, x1=%s, y1=%s, x2=%s, y2=%s
        WHERE dist_for_id=%s AND session_id=%s
        """
        cursor.execute(query, (
            data['line_num'],
            data['force_num'],
            data['force_dist'],
            data['x1'],
            data['y1'],
            data['x2'],
            data['y2'],
            force_id,
            session_id
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to update distributive force data.'}), 500


# Delete a distributive force
@app.route('/delete-distributive-force/<int:force_id>', methods=['DELETE'])
def delete_distributive_force(force_id):
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "DELETE FROM dist_forces_table WHERE dist_for_id=%s AND session_id=%s"
        cursor.execute(query, (force_id, session_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to delete distributive force.'}), 500

# Save body force data
@app.route('/save-body-force', methods=['POST'])
def save_body_force():
    data = request.json
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO body_forces_table (line_num, dens_num, dens_val, area, E, x_bf1, y_bf1, x_bf2, y_bf2, session_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            data['line_num'],
            data['dens_num'],
            data['dens_val'],
            data['area'],
            data['E'],
            data['x_bf1'],
            data['y_bf1'],
            data['x_bf2'],
            data['y_bf2'],
            session_id
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to save body force data.'}), 500

# Get all body forces for the session
@app.route('/get-body-forces', methods=['GET'])
def get_body_forces():
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT body_for_id, line_num, dens_num FROM body_forces_table WHERE session_id=%s"
        cursor.execute(query, (session_id,))
        forces = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({'status': 'success', 'forces': [{'body_for_id': f[0], 'line_num': f[1], 'dens_num': f[2]} for f in forces]})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to fetch body forces.'}), 500

# Get a single body force by ID
@app.route('/get-body-force/<int:force_id>', methods=['GET'])
def get_body_force(force_id):
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT line_num, dens_num, dens_val, area, E, x_bf1, y_bf1, x_bf2, y_bf2 FROM body_forces_table WHERE body_for_id=%s AND session_id=%s"
        cursor.execute(query, (force_id, session_id))
        force_data = cursor.fetchone()
        cursor.close()
        conn.close()

        if force_data:
            return jsonify({'status': 'success', 'force_data': {
                'line_num': force_data[0],
                'dens_num': force_data[1],
                'dens_val': force_data[2],
                'area': force_data[3],
                'E': force_data[4],
                'x_bf1': force_data[5],
                'y_bf1': force_data[6],
                'x_bf2': force_data[7],
                'y_bf2': force_data[8]
            }})
        else:
            return jsonify({'status': 'error', 'message': 'Body force not found.'}), 404
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to fetch body force data.'}), 500

# Update a body force
@app.route('/update-body-force/<int:force_id>', methods=['PUT'])
def update_body_force(force_id):
    data = request.json
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        UPDATE body_forces_table
        SET line_num=%s, dens_num=%s, dens_val=%s, area=%s, E=%s, x_bf1=%s, y_bf1=%s, x_bf2=%s, y_bf2=%s
        WHERE body_for_id=%s AND session_id=%s
        """
        cursor.execute(query, (
            data['line_num'],
            data['dens_num'],
            data['dens_val'],
            data['area'],
            data['E'],
            data['x_bf1'],
            data['y_bf1'],
            data['x_bf2'],
            data['y_bf2'],
            force_id,
            session_id
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to update body force data.'}), 500

# Delete a body force
@app.route('/delete-body-force/<int:force_id>', methods=['DELETE'])
def delete_body_force(force_id):
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "DELETE FROM body_forces_table WHERE body_for_id=%s AND session_id=%s"
        cursor.execute(query, (force_id, session_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to delete body force.'}), 500



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
