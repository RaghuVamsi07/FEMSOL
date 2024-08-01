import subprocess
import os

def start_app(script_name, base_directory):
    python_executable = os.path.join(r"D:\FEMSOL\FEM Interface\public\myenv\Scripts\python.exe")
    script_path = os.path.join(base_directory, f"{script_name}.py")
    command = f'"{python_executable}" "{script_path}"'
    return subprocess.Popen(command, shell=True)

if __name__ == "__main__":
    print("Master app is running. Starting individual apps...")
    apps = [
        ("app", r"D:\FEMSOL\FEM Interface\public\GLML1DS\1D_Bars"),
        ("plot_app", r"D:\FEMSOL\FEM Interface\public\GLML1DS\1D_Bars")
    ]
    
    processes = [start_app(app, base_directory) for app, base_directory in apps]

    for proc in processes:
        proc.wait()
