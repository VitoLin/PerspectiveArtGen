import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";

// Setup
// Setup canvases
const overlayCanvas = document.getElementById("overlayCanvas");
overlayCanvas.height = window.innerHeight;
overlayCanvas.width = window.innerWidth;
const ctx = overlayCanvas.getContext("2d");
const threeCanvas = document.getElementById("threeCanvas");

// Setup scene
const scene = new THREE.Scene();

// Set scene
const renderer = new THREE.WebGLRenderer({
	canvas: threeCanvas,
	powerPreference: "high-performance",
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
scene.background = new THREE.Color(0xffffff);

// Set up camera with boom
// Set up camera
let cameraPositionVector = new THREE.Vector3(0, 0, 0);
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

// Set up boom
const boom = new THREE.Group();
boom.add(camera);
scene.add(boom);
const boomLength = 200;
camera.position.set(0, 0, boomLength); // this sets the boom's length
camera.lookAt(0, 0, 0); // camera looks at the boom's zero

// Animation loop
function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

// Initialization
let perspectiveObjects = null;
function initialize() {
	// Load images
	// Images and function to run when images are loaded
	fetch("sceneData.json")
		.then((response) => response.json())
		.then((jsonData) => {
            perspectiveObjects = jsonData.objects;
            
            setupScene();
            animate();   
            
		})
		.catch((error) => {
			console.error("Error loading JSON:", error);
		});
}


// Check if WebGL is available
if (WebGL.isWebGLAvailable()) {
	initialize();
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById("container").appendChild(warning);
}

// Rotations
const views = [0, Math.PI / 4, Math.PI / 2];

// DRAW OBJECTS IN SCENE
function setupScene() {
    drawObjects(perspectiveObjects);
}

// Handle keyboard input
document.addEventListener("keydown", function (event) {
    // Log the key code and key character to the console
    console.log("Key pressed:", event.key);

});

// Handle scroll
window.addEventListener("wheel", function (e) {
        const scrollSpeed = Math.PI * 0.005;
        const range = Math.PI * 0.015;
        boom.rotation.x += e.deltaY * scrollSpeed;

        views.forEach((view) => {
            if (boom.rotation.x > view - range && boom.rotation.x < view + range) {
                boom.rotation.x = view;
            }
        }); 
        boom.rotation.x = boom.rotation.x % (Math.PI * 2);
    }
);

// Functions
// Draw objects
function drawObjects(array) {
    array.forEach((object) => {
		let cube = drawCube(object.position[0], object.position[1], object.position[2], 0x000000, object.scale.width);
		cube.rotation.copy(new THREE.Euler(object.rotation[0], object.rotation[1], object.rotation[2]));
	});
    
}

// Draw cube
function drawCube(x, y, z, color, size) {
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, y, z);
    scene.add(cube);
    return cube;
}


