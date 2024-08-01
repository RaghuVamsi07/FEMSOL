from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import matplotlib.pyplot as plt
import numpy as np
import io
import base64

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

@app.route('/calculate-deformation', methods=['POST'])
def calculate_deformation():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT x1, y1, x2, y2 FROM lines_table")
        lines = cursor.fetchall()
        cursor.close()
        conn.close()
        
        if not lines:
            return jsonify({'status': 'error', 'message': 'No lines found in the database'})

        fig, ax = plt.subplots()

        # Plot original lines in dark black color
        for line in lines:
            x1, y1, x2, y2 = line
            ax.plot([x1, x2], [y1, y2], color='black', linewidth=1)

        deformed_lines = []
        for line in lines:
            x1, y1, x2, y2 = line
            x_coords = np.linspace(x1, x2, 50)
            y_coords = np.linspace(y1, y2, 50)
            
            deformation_x = np.linspace(0, 10, 50)  # Example linear deformation in x
            deformation_y = np.linspace(0, 10, 50)  # Example linear deformation in y

            deformed_x_coords = x_coords + deformation_x
            deformed_y_coords = y_coords + deformation_y

            deformation_magnitude = np.sqrt(deformation_x**2 + deformation_y**2)
            colors = plt.cm.viridis(deformation_magnitude / np.max(deformation_magnitude))
            
            for i in range(len(x_coords) - 1):
                ax.plot(deformed_x_coords[i:i+2], deformed_y_coords[i:i+2], color=colors[i])

        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.set_title('Deformation Plot')
        ax.grid(which='both', linestyle='--', linewidth=0.5)
        ax.minorticks_on()

        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        img_base64 = base64.b64encode(img.getvalue()).decode()

        return jsonify({'status': 'success', 'image': img_base64})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/check-deformation', methods=['POST'])
def check_deformation():
    try:
        data = request.json
        x = float(data['x'])
        y = float(data['y'])

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT x1, y1, x2, y2 FROM lines_table")
        lines = cursor.fetchall()
        cursor.close()
        conn.close()

        on_line = False
        for line in lines:
            x1, y1, x2, y2 = line
            # Check if the point (x, y) is on the line segment (x1, y1) to (x2, y2)
            cross_product = (y - y1) * (x2 - x1) - (x - x1) * (y2 - y1)
            if abs(cross_product) > 1e-7:
                continue
            
            dot_product = (x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)
            if dot_product < 0:
                continue
            
            squared_length = (x2 - x1)**2 + (y2 - y1)**2
            if dot_product > squared_length:
                continue
            
            on_line = True
            break

        if not on_line:
            return jsonify({'status': 'error', 'message': 'The point is not on any line'})

        # Assuming a simple linear deformation model for demonstration purposes
        deformation_x = x * 0.1  # Example deformation calculation
        deformation_y = y * 0.1  # Example deformation calculation
        deformation = np.sqrt(deformation_x**2 + deformation_y**2)

        return jsonify({'status': 'success', 'deformation': deformation})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == "__main__":
    app.run(port=5001, debug=True)
