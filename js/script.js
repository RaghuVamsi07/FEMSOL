document.addEventListener('DOMContentLoaded', () => {
    const viewer = document.getElementById('viewer');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, viewer.clientWidth / viewer.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
    renderer.setClearColor(0xffffff); // Set clear color to white
    viewer.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 100);
    controls.update();

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    function render() {
        requestAnimationFrame(render);
        controls.update();
        renderer.render(scene, camera);
    }

    render();

    let currentMesh;

    document.getElementById('fileInput').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const contents = e.target.result;
                const loader = new THREE.STLLoader();
                const geometry = loader.parse(contents);

                if (currentMesh) {
                    scene.remove(currentMesh);
                }

                const material = new THREE.MeshPhongMaterial({ color: 0x5C5C5C });
                const mesh = new THREE.Mesh(geometry, material);
                currentMesh = mesh;
                scene.add(mesh);

                const box = new THREE.Box3().setFromObject(mesh);
                const center = box.getCenter(new THREE.Vector3());
                mesh.position.sub(center);

                const scale = document.getElementById('scaleSelect').value;
                let scaleFactor = 1;
                switch (scale) {
                    case 'mm':
                        scaleFactor = 1;
                        break;
                    case 'cm':
                        scaleFactor = 10;
                        break;
                    case 'm':
                        scaleFactor = 1000;
                        break;
                }
                mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

                applyRotation(mesh);
            };
            reader.readAsArrayBuffer(file);
        }
    });

    document.getElementById('axisSelect').addEventListener('change', () => {
        if (currentMesh) {
            applyRotation(currentMesh);
        }
    });

    function applyRotation(mesh) {
        const axis = document.getElementById('axisSelect').value;
        mesh.rotation.set(0, 0, 0); // Reset rotation
        switch (axis) {
            case 'x':
                camera.position.set(100, 0, 0);
                break;
            case 'y':
                camera.position.set(0, 100, 0);
                break;
            case 'z':
                camera.position.set(0, 0, 100);
                break;
        }
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        controls.update();
    }
});

function uploadAndAnalyze() {
    alert('Upload and Analyze function called');
}
