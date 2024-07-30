let scene, camera, renderer, earthMesh, triangulationSphere, raycaster, mouse;
let currentCountryIndex = 0;
let minZoom = 0.6;
let maxZoom = 2;
let currentZoom = 1.5;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let markers = [];
let lines;

const locations = [
    { name: "United States (Washington D.C.)", lat: 38.8951, lon: -77.0364 },
    { name: "Canada (Ottawa)", lat: 45.4215, lon: -75.6972 },
    { name: "UAE (Dubai)", lat: 25.2048, lon: 55.2708 },
    { name: "Bangladesh (Dhaka)", lat: 23.8103, lon: 90.4125 },
    { name: "Australia (Canberra)", lat: -35.2809, lon: 149.1300 },
    { name: "United Kingdom (London)", lat: 51.5074, lon: -0.1278 }
];

function init() {
    console.log("Initializing...");

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, currentZoom);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

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

    createTriangulationSphere();

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x888888));

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('mouseup', onMouseUp, false);
    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
    renderer.domElement.addEventListener('click', onClick, false);
    window.addEventListener('keydown', onKeyDown, false);

    console.log("Initialization complete");
}

function createTriangulationSphere() {
    const geometry = new THREE.SphereGeometry(0.4, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        visible: false,
        opacity: 0
    });
    triangulationSphere = new THREE.Mesh(geometry, material);
    scene.add(triangulationSphere);

    const markerGeometry = new THREE.SphereGeometry(0.01, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    locations.forEach(loc => {
        const pos = latLonToVector3(loc.lat, loc.lon, 0.4);
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(pos);
        marker.userData = loc;
        triangulationSphere.add(marker);
        markers.push(marker);
    });

    
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

function updateInfoPanel(location = null) {
    const infoPanel = document.getElementById('info');
    if (infoPanel) {
        if (location) {
            infoPanel.innerHTML = `
                <h2>Location Info</h2>
                <p>Name: ${location.name}</p>
                <p>Latitude: ${location.lat}</p>
                <p>Longitude: ${location.lon}</p>
            `;
        } else {
            infoPanel.innerHTML = `
                <h2>Triangulation Info</h2>
                ${markers.map((marker, index) => `
                    <p>Location ${index + 1}: ${locations[index].name}</p>
                    <p>Lat: ${locations[index].lat.toFixed(4)}, Lon: ${locations[index].lon.toFixed(4)}</p>
                    <p>X: ${marker.position.x.toFixed(4)}, Y: ${marker.position.y.toFixed(4)}, Z: ${marker.position.z.toFixed(4)}</p>
                `).join('')}
            `;
        }
    }
}

function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markers);

    if (intersects.length > 0) {
        const intersectedMarker = intersects[0].object;
        const location = intersectedMarker.userData;
        updateInfoPanel(location);
        console.log(`Clicked on marker for ${location.name}`);
    }
}

function onDocumentMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markers);

    const hoverInfo = document.getElementById('hover-info');

    markers.forEach(marker => marker.scale.set(1, 1, 1)); // Reset marker scale

    if (intersects.length > 0) {
        const intersectedMarker = intersects[0].object;
        const location = intersectedMarker.userData;
        hoverInfo.style.display = 'block';
        hoverInfo.style.left = event.clientX + 10 + 'px';
        hoverInfo.style.top = event.clientY + 10 + 'px';
        hoverInfo.innerHTML = location.name;
        intersectedMarker.scale.set(1.5, 1.5, 1.5); // Enlarge marker on hover
    } else {
        hoverInfo.style.display = 'none';
    }
}

init();
animate();

console.log("Script execution completed");
