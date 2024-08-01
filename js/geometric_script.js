let scene, camera, renderer, controls;
let stlLoader = new THREE.STLLoader();
let currentMesh = null;

init();

function init() {
    const viewer = document.getElementById('cad-viewer');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);  // Set the background color to white

    camera = new THREE.PerspectiveCamera(75, viewer.clientWidth / viewer.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 200);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
    viewer.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white ambient light
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight1.position.set(1, 1, 1).normalize();
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-1, -1, -1).normalize();
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight3.position.set(0, 1, -1).normalize();
    scene.add(directionalLight3);

    const directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight4.position.set(0, -1, 1).normalize();
    scene.add(directionalLight4);

    animate();
}

document.getElementById('upload-analyze-button').addEventListener('click', function () {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    const axisSelect = document.getElementById('axis-select').value;

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const contents = e.target.result;
            const geometry = stlLoader.parse(contents);
            const material = new THREE.MeshPhongMaterial({ color: 0x0055ff });
            const mesh = new THREE.Mesh(geometry, material);

            if (currentMesh) {
                scene.remove(currentMesh);
            }

            currentMesh = mesh;
            scene.add(mesh);

            adjustOrientation(mesh, axisSelect);
        };
        reader.readAsArrayBuffer(file);
    }
});

function adjustOrientation(mesh, axis) {
    if (axis === 'x') {
        mesh.rotation.set(Math.PI / 2, 0, 0);
    } else if (axis === 'y') {
        mesh.rotation.set(0, Math.PI / 2, 0);
    } else if (axis === 'z') {
        mesh.rotation.set(0, 0, 0);
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize(){
    const viewer = document.getElementById('cad-viewer');
    camera.aspect = viewer.clientWidth / viewer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
}


document.getElementById('upload-analyze-button').addEventListener('click', function () {
    // Existing code for the View button
});

document.getElementById('analyze-button').addEventListener('click', function () {
    window.location.href = 'analysis_page.html'; // Redirect to another webpage
});

