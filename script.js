let scene, camera, renderer, earthMesh, triangulationSphere;
let currentCountryIndex = 0;
let minZoom = 0.6;
let maxZoom = 2;
let currentZoom = 1.5;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let raycaster, mouse;
let markers = [];
let lines;

const locations = [
    { name: "Location 1", lat: 37.0902, lon: -95.7129 },
    { name: "Location 2", lat: -14.2350, lon: -51.9253 },
    { name: "Location 3", lat: 61.5240, lon: 105.3188 }
];

function init() {
    console.log("Initializing...");

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, currentZoom);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Load your Earth model
    const loader = new THREE.GLTFLoader();
    loader.load(
        './models/scene.gltf',
        function (gltf) {
            earthMesh = gltf.scene;
            earthMesh.scale.set(0.4, 0.4, 0.4);
            scene.add(earthMesh);
            console.log("Earth model loaded and added to scene:", earthMesh);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error happened', error);
        }
    );

    // Create triangulation sphere
    createTriangulationSphere();

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x333333));

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('mouseup', onMouseUp, false);
    window.addEventListener('keydown', onKeyDown, false);

    console.log("Initialization complete");
}

function createTriangulationSphere() {
    const geometry = new THREE.SphereGeometry(0.4, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    triangulationSphere = new THREE.Mesh(geometry, material);
    scene.add(triangulationSphere);

    // Add location markers and lines
    const markerGeometry = new THREE.SphereGeometry(0.01, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    
    locations.forEach(loc => {
        const pos = latLonToVector3(loc.lat, loc.lon, 0.4);
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(pos);
        triangulationSphere.add(marker);
        markers.push(marker);
    });

    // Create lines between markers
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(markers.map(m => m.position));
    lines = new THREE.Line(lineGeometry, lineMaterial);
    triangulationSphere.add(lines);
}

function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(triangulationSphere);

    if (intersects.length > 0) {
        markers[0].position.copy(intersects[0].point);
        updateLines();
    }

    if (isDragging && earthMesh) {
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        const rotationSpeed = 0.005;
        earthMesh.rotation.y += deltaMove.x * rotationSpeed;
        earthMesh.rotation.x += deltaMove.y * rotationSpeed;
        triangulationSphere.rotation.y += deltaMove.x * rotationSpeed;
        triangulationSphere.rotation.x += deltaMove.y * rotationSpeed;

        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
}

function updateLines() {
    lines.geometry.setFromPoints(markers.map(m => m.position));
    lines.geometry.attributes.position.needsUpdate = true;
}

function onMouseUp() {
    isDragging = false;
}

function onKeyDown(event) {
    if (event.key === 'e') {
        currentZoom = Math.max(minZoom, currentZoom - 0.1);
        animateZoom(currentZoom);
    } else if (event.key === 'q') {
        currentZoom = Math.min(maxZoom, currentZoom + 0.1);
        animateZoom(currentZoom);
    }
}

function animateZoom(targetZoom) {
    gsap.to(camera.position, {
        z: targetZoom,
        duration: 0.5,
        ease: "power2.out"
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    updateInfoPanel();
}

function updateInfoPanel() {
    const infoPanel = document.getElementById('info');
    if (infoPanel) {
        infoPanel.innerHTML = `
            <h2>Triangulation Info</h2>
            ${markers.map((marker, index) => `
                <p>Location ${index + 1}: ${index === 0 ? 'Moving' : locations[index].name}</p>
                <p>X: ${marker.position.x.toFixed(4)}, Y: ${marker.position.y.toFixed(4)}, Z: ${marker.position.z.toFixed(4)}</p>
            `).join('')}
        `;
    }
}

init();
animate();

console.log("Script execution completed");