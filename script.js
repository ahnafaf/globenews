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


const locations = [
    { name: "United States", lat: 38.8951, lon: -77.0369, countryCode: 'US' },
    { name: "Canada", lat: 45.4215, lon: -75.6981, countryCode: 'CA' },
    { name: "United Arab Emirates", lat: 25.276987, lon: 55.296249, countryCode: 'AE' },
    { name: "Bangladesh", lat: 23.685, lon: 90.3563, countryCode: 'BD' },
    { name: "Australia", lat: -35.3081, lon: 149.1245, countryCode: 'AU' },
    { name: "United Kingdom", lat: 51.5074, lon: -0.1278, countryCode: 'GB' },
    { name: "China", lat: 39.9042, lon: 116.4074, countryCode: 'CN' },
    { name: "Brazil", lat: -15.8267, lon: -47.9218, countryCode: 'BR' },
    { name: "India", lat: 28.6139, lon: 77.209, countryCode: 'IN' },
    { name: "Russia", lat: 55.7558, lon: 37.6176, countryCode: 'RU' },
    { name: "Japan", lat: 35.6895, lon: 139.6917, countryCode: 'JP' },
    { name: "Germany", lat: 52.5200, lon: 13.4050, countryCode: 'DE' },
    { name: "France", lat: 48.8566, lon: 2.3522, countryCode: 'FR' },
    { name: "Italy", lat: 41.9028, lon: 12.4964, countryCode: 'IT' },
    { name: "South Africa", lat: -25.746, lon: 28.1871, countryCode: 'ZA' },
    { name: "Mexico", lat: 19.4326, lon: -99.1332, countryCode: 'MX' },
    { name: "South Korea", lat: 37.5665, lon: 126.978, countryCode: 'KR' },
    { name: "Saudi Arabia", lat: 24.7136, lon: 46.6753, countryCode: 'SA' },
    { name: "Turkey", lat: 41.0082, lon: 28.9784, countryCode: 'TR' },
    { name: "Argentina", lat: -34.6037, lon: -58.3816, countryCode: 'AR' },
    { name: "Spain", lat: 40.4168, lon: -3.7038, countryCode: 'ES' },
    { name: "Netherlands", lat: 52.3676, lon: 4.9041, countryCode: 'NL' },
    { name: "Poland", lat: 52.2297, lon: 21.0122, countryCode: 'PL' },
    { name: "Sweden", lat: 59.3293, lon: 18.0686, countryCode: 'SE' },
    { name: "Switzerland", lat: 46.2044, lon: 6.1432, countryCode: 'CH' },
    { name: "Belgium", lat: 50.8503, lon: 4.3517, countryCode: 'BE' },
    { name: "Austria", lat: 48.2082, lon: 16.3738, countryCode: 'AT' },
    { name: "Denmark", lat: 55.6761, lon: 12.5683, countryCode: 'DK' },
    { name: "Finland", lat: 60.1695, lon: 24.9354, countryCode: 'FI' },
    { name: "Norway", lat: 59.9139, lon: 10.7522, countryCode: 'NO' },
    { name: "Ireland", lat: 53.3498, lon: -6.2603, countryCode: 'IE' },
    { name: "Portugal", lat: 38.7167, lon: -9.139, countryCode: 'PT' },
    { name: "Greece", lat: 37.9838, lon: 23.7275, countryCode: 'GR' },
    { name: "Hungary", lat: 47.4979, lon: 19.0402, countryCode: 'HU' },
    { name: "Czech Republic", lat: 50.0755, lon: 14.4378, countryCode: 'CZ' },
    { name: "Slovakia", lat: 48.1486, lon: 17.1077, countryCode: 'SK' },
    { name: "Slovenia", lat: 46.0569, lon: 14.5058, countryCode: 'SI' },
    { name: "Croatia", lat: 45.8150, lon: 15.9819, countryCode: 'HR' },
    { name: "Bulgaria", lat: 42.6977, lon: 23.3219, countryCode: 'BG' },
    { name: "Romania", lat: 44.4268, lon: 26.1025, countryCode: 'RO' },
    { name: "Lithuania", lat: 54.6872, lon: 25.2797, countryCode: 'LT' },
    { name: "Latvia", lat: 56.9496, lon: 24.1052, countryCode: 'LV' },
    { name: "Estonia", lat: 59.4370, lon: 24.7535, countryCode: 'EE' },
    { name: "Ukraine", lat: 50.4501, lon: 30.5234, countryCode: 'UA' },
    { name: "Belarus", lat: 53.9045, lon: 27.5615, countryCode: 'BY' },
    { name: "Moldova", lat: 47.0105, lon: 28.8638, countryCode: 'MD' },
    { name: "Serbia", lat: 44.7866, lon: 20.4489, countryCode: 'RS' },
    { name: "Bosnia and Herzegovina", lat: 43.8563, lon: 18.4131, countryCode: 'BA' },
    { name: "North Macedonia", lat: 41.9973, lon: 21.4280, countryCode: 'MK' },
    { name: "Montenegro", lat: 42.4417, lon: 19.2636, countryCode: 'ME' },
    { name: "Albania", lat: 41.3275, lon: 19.8187, countryCode: 'AL' },
    { name: "Malta", lat: 35.8997, lon: 14.5147, countryCode: 'MT' },
    { name: "Cyprus", lat: 35.1856, lon: 33.3823, countryCode: 'CY' },
    { name: "Iceland", lat: 64.1355, lon: -21.8954, countryCode: 'IS' },
    { name: "Luxembourg", lat: 49.6117, lon: 6.1319, countryCode: 'LU' },
    { name: "Liechtenstein", lat: 47.1410, lon: 9.5209, countryCode: 'LI' },
    { name: "Monaco", lat: 43.7384, lon: 7.4246, countryCode: 'MC' },
    { name: "Andorra", lat: 42.5078, lon: 1.5211, countryCode: 'AD' },
    { name: "San Marino", lat: 43.9333, lon: 12.4500, countryCode: 'SM' },
    { name: "Vatican City", lat: 41.9029, lon: 12.4534, countryCode: 'VA' },
    { name: "Chile", lat: -33.4489, lon: -70.6693, countryCode: 'CL' },
    { name: "Colombia", lat: 4.7110, lon: -74.0721, countryCode: 'CO' },
    { name: "Peru", lat: -12.0464, lon: -77.0428, countryCode: 'PE' },
    { name: "Venezuela", lat: 10.4806, lon: -66.9036, countryCode: 'VE' },
    { name: "Uruguay", lat: -34.9011, lon: -56.1645, countryCode: 'UY' },
    { name: "Paraguay", lat: -25.2637, lon: -57.5759, countryCode: 'PY' },
    { name: "Bolivia", lat: -16.5000, lon: -68.1500, countryCode: 'BO' },
    { name: "Ecuador", lat: -0.1807, lon: -78.4678, countryCode: 'EC' },
    { name: "Cuba", lat: 23.1136, lon: -82.3666, countryCode: 'CU' },
    { name: "Costa Rica", lat: 9.9281, lon: -84.0907, countryCode: 'CR' },
    { name: "Panama", lat: 8.9824, lon: -79.5199, countryCode: 'PA' },
    { name: "Guatemala", lat: 14.6349, lon: -90.5069, countryCode: 'GT' },
    { name: "Honduras", lat: 14.0723, lon: -87.1921, countryCode: 'HN' },
    { name: "El Salvador", lat: 13.6929, lon: -89.2182, countryCode: 'SV' },
    { name: "Nicaragua", lat: 12.1140, lon: -86.2362, countryCode: 'NI' },
    { name: "Dominican Republic", lat: 18.4861, lon: -69.9312, countryCode: 'DO' },
    { name: "Haiti", lat: 18.5944, lon: -72.3074, countryCode: 'HT' },
    { name: "Jamaica", lat: 18.1096, lon: -77.2975, countryCode: 'JM' },
    { name: "Trinidad and Tobago", lat: 10.6918, lon: -61.2225, countryCode: 'TT' },
    { name: "Bahamas", lat: 25.0343, lon: -77.3963, countryCode: 'BS' },
    { name: "Barbados", lat: 13.1939, lon: -59.5432, countryCode: 'BB' },
    { name: "Belize", lat: 17.5046, lon: -88.1962, countryCode: 'BZ' },
    { name: "Guyana", lat: 6.8013, lon: -58.1551, countryCode: 'GY' },
    { name: "Suriname", lat: 5.8520, lon: -55.2038, countryCode: 'SR' },
    { name: "Antigua and Barbuda", lat: 17.1274, lon: -61.8468, countryCode: 'AG' },
    { name: "Dominica", lat: 15.3092, lon: -61.3794, countryCode: 'DM' },
    { name: "Grenada", lat: 12.0561, lon: -61.7486, countryCode: 'GD' },
    { name: "Saint Kitts and Nevis", lat: 17.3578, lon: -62.7830, countryCode: 'KN' },
    { name: "Saint Lucia", lat: 13.9094, lon: -60.9789, countryCode: 'LC' },
    { name: "Saint Vincent and the Grenadines", lat: 13.2528, lon: -61.1971, countryCode: 'VC' },
    { name: "Fiji", lat: -18.1416, lon: 178.4419, countryCode: 'FJ' },
    { name: "Samoa", lat: -13.7590, lon: -172.1046, countryCode: 'WS' },
    { name: "Tonga", lat: -21.1789, lon: -175.1982, countryCode: 'TO' },
    { name: "Tuvalu", lat: -7.1095, lon: 179.1940, countryCode: 'TV' },
    { name: "Vanuatu", lat: -17.7333, lon: 168.3273, countryCode: 'VU' },
    { name: "Solomon Islands", lat: -9.6457, lon: 160.1562, countryCode: 'SB' },
    { name: "Papua New Guinea", lat: -9.4438, lon: 147.1803, countryCode: 'PG' }
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

async function showPointMenu(location, event) {
    const menu = document.getElementById('point-menu');
    
    // Show loading state
    menu.innerHTML = `
        <h2>${location.name}</h2>
        <h4>Latest News</h4>
        <p>Loading news...</p>
    `;
    menu.style.display = 'block';
    positionMenu(menu, event);

    try {
        // Construct the news URL using the country name
        const newsURL = `/news?country=${encodeURIComponent(location.name)}`;

        // Fetch the news data
        const response = await fetch(newsURL);
        const newsItems = await response.json();

        let newsHTML = "";

        for (let i = 0; i < Math.min(newsItems.length, 5); i++) {
            const item = newsItems[i];
            newsHTML += `
                <div class="news-item">
                    <a href="${item.link}" class="news-link" target="_blank" style="color: #61dafb; text-decoration: none; font-size: 16px; font-weight: 500; display: block; margin-bottom: 5px;">${item.title}</a>
                    <p class="news-subtext">${item.snippet || 'No description available.'}</p>
                    <p class="news-meta">Source: ${item.source}</p>
                </div>
            `;
        }

        // Update menu with fetched news
        menu.innerHTML = `
            <h2>${location.name}</h2>
            <h4>Latest News</h4>
            ${newsHTML || '<p>No news available for this country at the moment.</p>'}
        `;

        // Add event listeners for hover effect
        const newsLinks = menu.querySelectorAll('.news-link');
        newsLinks.forEach(link => {
            link.addEventListener('mouseover', () => {
                link.style.textDecoration = 'underline';
            });
            link.addEventListener('mouseout', () => {
                link.style.textDecoration = 'none';
            });
        });
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
function hidePointMenu() {
    const menu = document.getElementById('point-menu');
    menu.style.display = 'none';
}



init();
animate();

console.log("Script execution completed");
