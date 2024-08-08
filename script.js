// Description: Main script for the 3D globe visualization.
let scene, camera, renderer, earthMesh, triangulationSphere, raycaster, mouse;
let currentCountryIndex = 0;
let minZoom = 0.6;
let maxZoom = 2;
let currentZoom = 1.5;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let markers = [];
let lines;

const apiToken = window.ENV.THENEWS_API_TOKEN;

const locations = [
    { name: "United States", lat: 38.8951, lon: -77.0369 },
    { name: "Canada", lat: 45.4215, lon: -75.6981 },
    { name: "United Arab Emirates", lat: 25.276987, lon: 55.296249 },
    { name: "Bangladesh", lat: 23.685, lon: 90.3563 },
    { name: "Australia", lat: -35.3081, lon: 149.1245 },
    { name: "United Kingdom", lat: 51.5074, lon: -0.1278 },
    { name: "China", lat: 39.9042, lon: 116.4074 },
    { name: "Brazil", lat: -15.8267, lon: -47.9218 },
    { name: "India", lat: 28.6139, lon: 77.209 },
    { name: "Russia", lat: 55.7558, lon: 37.6176 },
    { name: "Japan", lat: 35.6895, lon: 139.6917 },
    { name: "Germany", lat: 52.5200, lon: 13.4050 },
    { name: "France", lat: 48.8566, lon: 2.3522 },
    { name: "Italy", lat: 41.9028, lon: 12.4964 },
    { name: "South Africa", lat: -25.746, lon: 28.1871 },
    { name: "Mexico", lat: 19.4326, lon: -99.1332 },
    { name: "South Korea", lat: 37.5665, lon: 126.978 },
    { name: "Saudi Arabia", lat: 24.7136, lon: 46.6753 },
    { name: "Turkey", lat: 41.0082, lon: 28.9784 }
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
    const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7
    });

    locations.forEach(loc => {
        const pos = latLonToVector3(loc.lat, loc.lon, 0.4);
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(pos);
        marker.userData = loc;
        triangulationSphere.add(marker);
        markers.push(marker);

        // Create and add label
        const label = createLabel(loc.name);
        label.position.copy(pos);
        label.position.y += 0.01; // Adjust the position slightly above the marker

        triangulationSphere.add(label);
    });
}



function createLabel(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
  
    // Set the font style and size
    context.font = 'Bold 20px Arial';
  
    // Set the text color and fill the text
    context.fillStyle = 'rgba(255, 255, 255, 1.0)';
    context.fillText(text, 0, 20);
  
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
  
    // Set the texture to be transparent
    texture.transparent = true;
  
    // Create a sprite material using the texture
    const material = new THREE.SpriteMaterial({ map: texture });
  
    // Create a sprite using the material
    const sprite = new THREE.Sprite(material);
  
    // Adjust the scale of the sprite to your preference
    sprite.scale.set(0.1, 0.05, 1);
  
    return sprite;
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
}

function onClick(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markers);

    if (intersects.length > 0) {
        const intersectedMarker = intersects[0].object;
        const location = intersectedMarker.userData;    
        showPointMenu(location);
    } else {
        hidePointMenu();
    }
}

function onDocumentMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markers);

    markers.forEach(marker => marker.scale.set(1, 1, 1)); // Reset marker scale

    if (intersects.length > 0) {
        const intersectedMarker = intersects[0].object;
        intersectedMarker.scale.set(1.5, 1.5, 1.5); // Enlarge marker on hover
    }
}

async function showPointMenu(location) {
    const menu = document.getElementById('point-menu');
    
    // Show loading state
    menu.innerHTML = `
        <h2>${location.name}</h2>
        <h3>${location.capital}</h3>
        <h4>Latest News</h4>
        <p>Loading news...</p>
    `;
    menu.style.display = 'block';
    positionMenu(event);
    var requestOptions = {
        method: 'GET'
    };

    var today = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format

    var params = {
        api_token: apiToken,
        categories: 'general,politics',
        search: location.name,
        limit: '5',
        language: 'en',
        date: today
    };

    var esc = encodeURIComponent;
    var query = Object.keys(params)
        .map(function(k) {return esc(k) + '=' + esc(params[k]);})
        .join('&');

    try {
        // Make API call
        const response = await fetch("https://api.thenewsapi.com/v1/news/all?" + query, requestOptions);
        const newsData = await response.json();

        // Generate news HTML for today's news
        const newsHTML = newsData.data.filter(article => article.published_at.includes(today)).map(article => `
            <div class="news-item">
                <a href="${article.url}" class="news-link" target="_blank">${article.title}</a>
                <p class="news-subtext">${article.description || 'No description available.'}</p>
                <p class="news-meta">Published: ${new Date(article.published_at).toLocaleString()} | Source: ${article.source}</p>
            </div>
        `).join('');

        // Update menu with fetched news
        menu.innerHTML = `
            <h2>${location.name}</h2>
            <h3>${location.capital}</h3>
            <h4>Latest News</h4>
            ${newsHTML || '<p>No news available for this country at the moment.</p>'}
        `;
    } catch (error) {
        console.error('Error fetching news:', error);
        menu.innerHTML += '<p>Error loading news. Please try again later.</p>';
    }
}

function positionMenu(event) {
    const menu = document.getElementById('point-menu');
    const x = event.clientX;
    const y = event.clientY;
    
    // Calculate available space on the right and bottom
    const rightSpace = window.innerWidth - x;
    const bottomSpace = window.innerHeight - y;
    
    // Position the menu
    if (rightSpace > 320) { // Menu width + padding
        menu.style.left = `${x + 10}px`;
    } else {
        menu.style.left = `${x - 310}px`; // Menu width + padding
    }
    
    if (bottomSpace > menu.offsetHeight) {
        menu.style.top = `${y}px`;
    } else {
        menu.style.top = `${y - menu.offsetHeight}px`;
    }
}

// Update the event listener to pass the event object
document.addEventListener('click', function(event) {
    // Assuming you have a way to determine if a country was clicked
    if (clickedOnCountry) {
        const location = getCountryInfo(); // Your function to get country info
        showPointMenu(location, event);
    } else {
        hidePointMenu();
    }
});

function hidePointMenu() {
    const menu = document.getElementById('point-menu');
    menu.style.display = 'none';
}



init();
animate();

console.log("Script execution completed");
