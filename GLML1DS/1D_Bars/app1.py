from flask import Flask, jsonify, render_template
import matplotlib.pyplot as plt
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate-plot', methods=['POST'])
def generate_plot():
    # Data for plotting
    x = [1, 2, 3, 4, 5]
    y = [10, 20, 25, 30, 35]

    # Plotting the data
    plt.figure()
    plt.plot(x, y)
    plt.title('Sample Line Plot')
    plt.xlabel('x')
    plt.ylabel('y')

    # Ensure the static/img directory exists
    img_dir = 'static/img'
    if not os.path.exists(img_dir):
        os.makedirs(img_dir)

    # Save the plot
    plot_path = os.path.join(img_dir, 'line_plot.png')
    plt.savefig(plot_path)

    return jsonify({'img_path': plot_path})

if __name__ == '__main__':
    app.run(debug=True)
