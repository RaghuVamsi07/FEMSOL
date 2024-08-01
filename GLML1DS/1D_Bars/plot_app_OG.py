from flask import Flask, jsonify, render_template
import mysql.connector
import os
import matplotlib.pyplot as plt
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app for plotting
plot_app = Flask(__name__)

# Set up logging
logging.basicConfig(level=logging.INFO)

# Database configuration using environment variables
db_config = {
    'user': os.getenv('DB_USER', 'femsol_user'),
    'password': os.getenv('DB_PASSWORD', 'Dreamsneverdie@21'),
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'femsol_db')
}

# Create a connection pool
connection_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mypool_bars",
    pool_size=10,
    pool_reset_session=True,
    **db_config
)

def get_db_connection():
    return connection_pool.get_connection()

@plot_app.route('/generate-plot', methods=['POST'])
def generate_plot():
    logging.info("Starting plot generation...")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, x1, y1, x2, y2 FROM 1D_Bars_lines")
    lines = cursor.fetchall()
    cursor.close()
    conn.close()
    
    logging.info(f"Fetched lines from database: {lines}")

    plt.figure()
    for line in lines:
        logging.info(f"Plotting line: {line}")
        plt.plot([line['x1'], line['x2']], [line['y1'], line['y2']], marker='o')
    plt.title('Lines Analysis')
    plt.xlabel('X-axis')
    plt.ylabel('Y-axis')

    img_dir = os.path.join('static', 'img')
    logging.info(f"Image directory path: {img_dir}")
    
    if not os.path.exists(img_dir):
        logging.info("Image directory does not exist, creating it.")
        os.makedirs(img_dir)
    else:
        logging.info("Image directory exists.")

    img_path = os.path.join(img_dir, 'line_plot.png')
    plt.savefig(img_path)
    plt.close()
    
    logging.info(f"Plot saved to {img_path}")

    return jsonify({'status': 'success', 'img_path': img_path})

@plot_app.route('/results', methods=['GET'])
def results():
    return render_template('results.html')

if __name__ == '__main__':
    plot_app.run(debug=True, port=int(os.environ.get('PORT', 5001)))
