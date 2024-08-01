import os

test_file_path = os.path.join('GLML1DS', '1D_Bars', 'static', 'img', 'test_file.txt')
try:
    with open(test_file_path, 'w') as f:
        f.write("Testing write permissions")
    print(f"Successfully created file: {test_file_path}")
except Exception as e:
    print(f"Failed to create file: {test_file_path}, Error: {e}")
