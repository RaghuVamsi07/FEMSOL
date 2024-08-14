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

        # Clear body forces table
        query_body_forces = "DELETE FROM thermal_loads_table WHERE session_id=%s"
        cursor.execute(query_body_forces, (session_id,))

        # Clear body forces table
        query_body_forces = "DELETE FROM sing_bodyCons_FE WHERE session_id=%s"
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


# Save thermal load data
@app.route('/save-thermal-load', methods=['POST'])
def save_thermal_load():
    data = request.json
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO thermal_loads_table (line_num, alpha, T, xt1, yt1, xt2, yt2, session_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            data['line_num'],
            data['alpha'],
            data['T'],
            data['xt1'],
            data['yt1'],
            data['xt2'],
            data['yt2'],
            session_id
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to save thermal load data.'}), 500

# Get all thermal loads for the session
@app.route('/get-thermal-loads', methods=['GET'])
def get_thermal_loads():
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT thermal_load_id, line_num, alpha FROM thermal_loads_table WHERE session_id=%s"
        cursor.execute(query, (session_id,))
        forces = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({'status': 'success', 'forces': [{'thermal_load_id': f[0], 'line_num': f[1], 'alpha': f[2]} for f in forces]})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to fetch thermal loads.'}), 500

# Get a single thermal load by ID
@app.route('/get-thermal-load/<int:force_id>', methods=['GET'])
def get_thermal_load(force_id):
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT line_num, alpha, T, xt1, yt1, xt2, yt2 FROM thermal_loads_table WHERE thermal_load_id=%s AND session_id=%s"
        cursor.execute(query, (force_id, session_id))
        force_data = cursor.fetchone()
        cursor.close()
        conn.close()

        if force_data:
            return jsonify({'status': 'success', 'force_data': {
                'line_num': force_data[0],
                'alpha': force_data[1],
                'T': force_data[2],
                'xt1': force_data[3],
                'yt1': force_data[4],
                'xt2': force_data[5],
                'yt2': force_data[6]
            }})
        else:
            return jsonify({'status': 'error', 'message': 'Thermal load not found.'}), 404
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to fetch thermal load data.'}), 500

# Update a thermal load
@app.route('/update-thermal-load/<int:force_id>', methods=['PUT'])
def update_thermal_load(force_id):
    data = request.json
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        UPDATE thermal_loads_table
        SET line_num=%s, alpha=%s, T=%s, xt1=%s, yt1=%s, xt2=%s, yt2=%s
        WHERE thermal_load_id=%s AND session_id=%s
        """
        cursor.execute(query, (
            data['line_num'],
            data['alpha'],
            data['T'],
            data['xt1'],
            data['yt1'],
            data['xt2'],
            data['yt2'],
            force_id,
            session_id
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to update thermal load data.'}), 500

# Delete a thermal load
@app.route('/delete-thermal-load/<int:force_id>', methods=['DELETE'])
def delete_thermal_load(force_id):
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "DELETE FROM thermal_loads_table WHERE thermal_load_id=%s AND session_id=%s"
        cursor.execute(query, (force_id, session_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to delete thermal load.'}), 500



# Save BC1 data
@app.route('/save-bc1', methods=['POST'])
def save_bc1():
    data = request.json
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        INSERT INTO sing_bodyCons_FE (line_num, BC_num, x1, y1, x2, y2, session_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            data['line_num'],
            data['BC_num'],
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
        return jsonify({'status': 'error', 'message': 'Failed to save boundary condition data.'}), 500

# Get all BC1s for the session
@app.route('/get-bc1s', methods=['GET'])
def get_bc1s():
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT id, line_num, BC_num FROM sing_bodyCons_FE WHERE session_id=%s"
        cursor.execute(query, (session_id,))
        bc1s = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({'status': 'success', 'bc1s': [{'id': bc1[0], 'line_num': bc1[1], 'BC_num': bc1[2]} for bc1 in bc1s]})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to fetch boundary conditions.'}), 500

# Get a single BC1 by ID
@app.route('/get-bc1/<int:bc_id>', methods=['GET'])
def get_bc1(bc_id):
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT line_num, BC_num, x1, y1, x2, y2 FROM sing_bodyCons_FE WHERE id=%s AND session_id=%s"
        cursor.execute(query, (bc_id, session_id))
        bc1_data = cursor.fetchone()
        cursor.close()
        conn.close()

        if bc1_data:
            return jsonify({'status': 'success', 'bc1_data': {
                'line_num': bc1_data[0],
                'BC_num': bc1_data[1],
                'x1': bc1_data[2],
                'y1': bc1_data[3],
                'x2': bc1_data[4],
                'y2': bc1_data[5]
            }})
        else:
            return jsonify({'status': 'error', 'message': 'Boundary condition not found.'}), 404
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to fetch boundary condition data.'}), 500

# Update BC1 data
@app.route('/update-bc1/<int:bc_id>', methods=['PUT'])
def update_bc1(bc_id):
    data = request.json
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
        UPDATE sing_bodyCons_FE
        SET line_num=%s, BC_num=%s, x1=%s, y1=%s, x2=%s, y2=%s
        WHERE id=%s AND session_id=%s
        """
        cursor.execute(query, (
            data['line_num'],
            data['BC_num'],
            data['x1'],
            data['y1'],
            data['x2'],
            data['y2'],
            bc_id,
            session_id
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to update boundary condition data.'}), 500

# Delete BC1
@app.route('/delete-bc1/<int:bc_id>', methods=['DELETE'])
def delete_bc1(bc_id):
    session_id = request.cookies.get('session_id')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "DELETE FROM sing_bodyCons_FE WHERE id=%s AND session_id=%s"
        cursor.execute(query, (bc_id, session_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to delete boundary condition.'}), 500


@app.route('/generate-mesh', methods=['POST'])
def generate_mesh():
    data = request.json
    session_id = data['session_id']
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch data from lines_table
        cursor.execute("SELECT line_num, x1, y1, x2, y2 FROM lines_table WHERE session_id=%s", (session_id,))
        lines_data = cursor.fetchall()

        # Fetch data from sing_bodyCons_FE table (BC1 data)
        cursor.execute("SELECT line_num, BC_num, x1, y1, x2, y2 FROM sing_bodyCons_FE WHERE session_id=%s", (session_id,))
        bc_data = cursor.fetchall()

        # Fetch data from forces_table
        cursor.execute("SELECT line_num, fx, fy, x, y FROM forces_table WHERE session_id=%s", (session_id,))
        forces_data = cursor.fetchall()

        # Fetch data from dist_forces_table
        cursor.execute("SELECT line_num, x1, y1, x2, y2 FROM dist_forces_table WHERE session_id=%s", (session_id,))
        dist_forces_data = cursor.fetchall()

        # Fetch data from body_forces_table
        cursor.execute("SELECT line_num, x1, y1, x2, y2 FROM body_forces_table WHERE session_id=%s", (session_id,))
        body_forces_data = cursor.fetchall()

        # Fetch data from thermal_loads_table
        cursor.execute("SELECT line_num, xt1, yt1, xt2, yt2 FROM thermal_loads_table WHERE session_id=%s", (session_id,))
        thermal_loads_data = cursor.fetchall()

        # Combine the data and remove duplicates (server-side processing)
        primary_nodes = {}
        
        # Process lines_table data
        for line in lines_data:
            if line[0] not in primary_nodes:
                primary_nodes[line[0]] = []
            primary_nodes[line[0]].append({'x': line[1], 'y': line[2]})
            primary_nodes[line[0]].append({'x': line[3], 'y': line[4]})
        
        # Process sing_bodyCons_FE (BC1) data
        for bc in bc_data:
            if bc[0] not in primary_nodes:
                primary_nodes[bc[0]] = []
            primary_nodes[bc[0]].append({'x': bc[2], 'y': bc[3]})
            primary_nodes[bc[0]].append({'x': bc[4], 'y': bc[5]})

        # Process forces_table data
        for force in forces_data:
            if force[0] not in primary_nodes:
                primary_nodes[force[0]] = []
            primary_nodes[force[0]].append({'x': force[3], 'y': force[4]})

        # Process dist_forces_table data
        for dist_force in dist_forces_data:
            if dist_force[0] not in primary_nodes:
                primary_nodes[dist_force[0]] = []
            primary_nodes[dist_force[0]].append({'x': dist_force[1], 'y': dist_force[2]})
            primary_nodes[dist_force[0]].append({'x': dist_force[3], 'y': dist_force[4]})

        # Process body_forces_table data
        for body_force in body_forces_data:
            if body_force[0] not in primary_nodes:
                primary_nodes[body_force[0]] = []
            primary_nodes[body_force[0]].append({'x': body_force[1], 'y': body_force[2]})
            primary_nodes[body_force[0]].append({'x': body_force[3], 'y': body_force[4]})

        # Process thermal_loads_table data
        for thermal_load in thermal_loads_data:
            if thermal_load[0] not in primary_nodes:
                primary_nodes[thermal_load[0]] = []
            primary_nodes[thermal_load[0]].append({'x': thermal_load[1], 'y': thermal_load[2]})
            primary_nodes[thermal_load[0]].append({'x': thermal_load[3], 'y': thermal_load[4]})
        
        # Remove duplicate nodes
        for line_num in primary_nodes:
            primary_nodes[line_num] = remove_duplicates(primary_nodes[line_num])

        cursor.close()
        conn.close()

        return jsonify({'status': 'success', 'primary_nodes': primary_nodes})

    except Exception as e:
        print(f"Error generating mesh: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to generate mesh.'}), 500

def remove_duplicates(nodes):
    unique_nodes = []
    seen = set()

    for node in nodes:
        coord = (node['x'], node['y'])
        if coord not in seen:
            unique_nodes.append(node)
            seen.add(coord)

    return unique_nodes



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
