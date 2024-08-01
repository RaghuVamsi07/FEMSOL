import os

path = os.path.join('GLML1DS', '1D_Bars', 'static', 'img')
print("Checking permissions for directory:", path)
print("Write permissions:", os.access(path, os.W_OK))
