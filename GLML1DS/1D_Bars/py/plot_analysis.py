import matplotlib.pyplot as plt
import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

# Database connection details from environment variables
DB_HOST = os.getenv('DB_HOST')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME')

def fetch_data():
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = connection.cursor()
        cursor.execute("SELECT id, x1, y1, x2, y2 FROM 1D_Bars_lines")
        rows = cursor.fetchall()
        cursor.close()
        connection.close()
        return rows
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return []

def plot_data(rows):
    fig, ax = plt.subplots()
    for row in rows:
        x_values = [row[1], row[3]]
        y_values = [row[2], row[4]]
        ax.plot(x_values, y_values)
    
    img_dir = os.path.join(os.path.dirname(__file__), '..', 'static', 'img')
    if not os.path.exists(img_dir):
        os.makedirs(img_dir)
    img_path = os.path.join(img_dir, 'line_plot.png')
    fig.savefig(img_path)
    plt.close(fig)
    
    # Create status file to indicate completion
    with open(os.path.join(img_dir, 'status.txt'), 'w') as f:
        f.write('done')

if __name__ == "__main__":
    data = fetch_data()
    if data:
        plot_data(data)
    else:
        print("No data fetched from the database.")
