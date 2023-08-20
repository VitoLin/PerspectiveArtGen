import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

// const camera = new THREE.OrthographicCamera(
// 	window.innerWidth / -2,
// 	window.innerWidth / 2,
// 	window.innerHeight / 2,
// 	window.innerHeight / -2,
// 	1,
// 	1000
// );

// Set scene
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0xffffff);

const boom = new THREE.Group();
boom.add(camera);
scene.add(boom);
camera.position.set(0, 0, 200); // this sets the boom's length
camera.lookAt(0, 0, 0); // camera looks at the boom's zero

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
camera.updateMatrixWorld(); //Update the camera location
let vector = camera.position.clone(); //Get camera position and put into variable
vector.applyMatrix4(camera.matrixWorld); //Hold the camera location in matrix world
directionalLight.position.set(vector.x, vector.y, vector.z);

scene.add(directionalLight);

// Images
fetch("images.json")
	.then((response) => response.json())
	.then((jsonData) => {
		let imagexy = jsonData.one;
        let imageyz = jsonData.two;
        let imagezx = jsonData.three;

		for (let x = 0; x < matrixSize; x++) {
			for (let y = 0; y < matrixSize; y++) {
				for (let z = 0; z < matrixSize; z++) {
					// images are x,y y,z z,x
					// xy imagexy[matrixSize - y - 1][x] == 1
					// yz imageyz[matrixSize - y - 1][z] == 1
                    // zx imagezx[z][x] == 1
                    if (imagexy[matrixSize - y - 1][x] == 1 && imageyz[matrixSize - y - 1][z] == 1) {
						addSphere(x, y, z, sphereColor, sphereRadius);
					}
				}
			}
		}
	})
	.catch((error) => {
		console.error("Error loading JSON:", error);
	});

// Add spheres to the scene
const matrixSize = 20; // Adjust the size of the matrix
const sphereRadius = 3;
const sphereColor = 0x000000;

function addSphere(x, y, z, color, radius) {
	const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
	const sphereMaterial = new THREE.MeshLambertMaterial({
		color: color,
	});
	const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

	// Position spheres in a grid pattern
	sphere.position.set(
		x * 4 - (matrixSize - 1) * 2,
		y * 4 - (matrixSize - 1) * 2,
		z * 4 - (matrixSize - 1) * 2
	);

	scene.add(sphere);
}

// for (let x = 0; x < matrixSize; x++) {
//     for (let y = 0; y < matrixSize; y++) {
//         for (let z = 0; z < matrixSize; z++) {
//             // images are x,y y,z z,x
//             if (x == 0) {
//                 addSphere(x, y, z, sphereColor, sphereRadius);
//             }
//         }
//     }
// }

// Camera controls
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

document.addEventListener("mousedown", (event) => {
	isDragging = true;
	previousMousePosition = {
		x: event.clientX,
		y: event.clientY,
	};
});

document.addEventListener("mouseup", () => {
	isDragging = false;
});

document.addEventListener("mousemove", (event) => {
	if (!isDragging) return;

	const deltaX = event.clientX - previousMousePosition.x;
	const deltaY = event.clientY - previousMousePosition.y;

	// Adjust camera rotation based on mouse drag
	boom.rotation.y -= deltaX * 0.005;
	boom.rotation.x -= deltaY * 0.005;

	previousMousePosition = {
		x: event.clientX,
		y: event.clientY,
	};

	camera.updateMatrixWorld(); //Update the camera location
	vector = camera.position.clone(); //Get camera position and put into variable
	vector.applyMatrix4(camera.matrixWorld); //Hold the camera location in matrix world
	directionalLight.position.set(vector.x, vector.y, vector.z);
});

function animate() {
	requestAnimationFrame(animate);

	renderer.render(scene, camera);
}

if (WebGL.isWebGLAvailable()) {
	animate();
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById("container").appendChild(warning);
}
