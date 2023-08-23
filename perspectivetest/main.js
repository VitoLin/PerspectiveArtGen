import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";

const overlayCanvas = document.getElementById("overlayCanvas");
overlayCanvas.height = window.innerHeight;
overlayCanvas.width = window.innerWidth;
const ctx = overlayCanvas.getContext("2d");

const threeCanvas = document.getElementById("threeCanvas");

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
const renderer = new THREE.WebGLRenderer({overlayCanvas: threeCanvas});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0xffffff);

const boom = new THREE.Group();
boom.add(camera);
scene.add(boom);
const boomLength = 200;
camera.position.set(0, 0, boomLength); // this sets the boom's length
camera.lookAt(0, 0, 0); // camera looks at the boom's zero

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
camera.updateMatrixWorld(); //Update the camera location
let vector = camera.position.clone(); //Get camera position and put into variable
vector.applyMatrix4(camera.matrixWorld); //Hold the camera location in matrix world
directionalLight.position.set(vector.x, vector.y, vector.z);

scene.add(directionalLight);

// Functions
// function toScreenPosition(obj, camera)
// {
//     var vector = new THREE.Vector3();

//     var widthHalf = 0.5 * renderer.getContext().canvas.width;
//     var heightHalf = 0.5 * renderer.getContext().canvas.height;

//     obj.updateMatrixWorld();
//     vector.setFromMatrixPosition(obj.matrixWorld);
//     vector.project(camera);

//     vector.x = ( vector.x * widthHalf ) + widthHalf;
//     vector.y = - (vector.y * heightHalf) + heightHalf;

//     return { 
//         x: vector.x,
//         y: vector.y
//     };

// };

// function toWorldPosition(screenX, screenY, camera) {
//     var vector = new THREE.Vector3();
    
//     camera.updateMatrixWorld(); 

// 	var widthHalf = 0.5 * renderer.getContext().canvas.width;
//     var heightHalf = 0.5 * renderer.getContext().canvas.height;
    

// 	vector.x = (screenX - widthHalf) / widthHalf;
// 	vector.y = -(screenY - heightHalf) / heightHalf;
// 	vector.z = -1; // Assuming z is in the range of [0, 1]

// 	vector.unproject(camera);

//     return {
//         x: vector.x,
//         y: vector.y,
//         z: vector.z
//     }
// }


// Images and function to run when images are loaded
fetch("images.json")
	.then((response) => response.json())
	.then((jsonData) => {
		let imagexy = jsonData.one;
        let imageyz = jsonData.two;
        let imagezx = jsonData.three;

        drawSpheres(imagexy, imageyz, imagezx);
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
    return sphere;
}

// Draw Sphere
function drawSphere(x,y,z,color,radius) {
    const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
	const sphereMaterial = new THREE.MeshLambertMaterial({
		color: color,
	});
	const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    // Draw sphere at x, y, z
	sphere.position.set(x, y, z);

	scene.add(sphere);
}

// Draw spheres
let sphereMatrix = [];
let sphereArray = [];

function drawSpheres(imagexy, imageyz, imagezx) {
    for (let x = 0;x < matrixSize;x++) {
        sphereMatrix.push([]);
        for (let y = 0;y < matrixSize;y++) {
            sphereMatrix[x].push([]);
            for (let z = 0;z < matrixSize;z++) {
                // images are x,y y,z z,x
                // xy imagexy[matrixSize - y - 1][x] == 1
                // yz imageyz[matrixSize - y - 1][z] == 1
                // zx imagezx[z][x] == 1
                if (imagexy[matrixSize - y - 1][x] == 1 && imageyz[matrixSize - y - 1][z] == 1) {
                    let sphere = addSphere(x, y, z, sphereColor, sphereRadius);
                    sphereMatrix[x][y].push(sphere);
                    sphereArray.push(sphere);
                }
                else {
                    sphereMatrix[x][y].push(null);
                }
            }
        }
    }
}

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

});

// Update light position
function updateCameraPosition() {
    camera.updateMatrixWorld(); //Update the camera location
	vector = camera.position.clone(); //Get camera position and put into variable
	vector.applyMatrix4(camera.matrixWorld); //Hold the camera location in matrix world
	directionalLight.position.set(vector.x, vector.y, vector.z);
}

// Render
function animate() {
    requestAnimationFrame(animate);
    updateCameraPosition();

	renderer.render(scene, camera);
}

if (WebGL.isWebGLAvailable()) {
	animate();
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById("container").appendChild(warning);
}

// Draw Sphere at the center of world
// drawSphere(0, 0, 0, 0x000000, 10);
// drawSphere(10, 0, 0, 0xff0000, 10);
// drawSphere(0, 10, 0, 0x00ff00, 10);
// drawSphere(0, 0, 10, 0x0000ff, 10);

// Keyboard input
let i = 0;
document.addEventListener("keydown", function (event) {
    // Log the key code and key character to the console
    console.log("Key pressed:", event.key);

    
    // Rotate the boom to the x y z faces
    let bx = boom.rotation.x;
    let by = boom.rotation.y;
    let bz = boom.rotation.z;

    if (event.key == "w") {
        bx += Math.PI / 2;
    }
    if (event.key == "a") {
        by -= Math.PI / 2;
    }
    if (event.key == "d") {
        by += Math.PI / 2;

    }
    if (event.key == "s") {
        bx -= Math.PI / 2;
    }
    if (event.key == " ") {
        bx = 0;
        by = 0;
        bz = 0;
    }

    // keep rotation within 0 and 2pi
    bx = bx % (2 * Math.PI);
    by = by % (2 * Math.PI);
    bz = bz % (2 * Math.PI);
    
    boom.rotation.set(bx, by, bz);
    
    let s = sphereArray[i];
    // Log sphere positions
    if (event.key == "p") {
        console.log("sphere:", s.position.x, s.position.y, s.position.z);
        console.log("camera:", camera.position.x, camera.position.y, camera.position.z);

        console.log("boom:", boom.rotation.x * 180 / Math.PI, boom.rotation.y * 180 / Math.PI, boom.rotation.z * 180 / Math.PI);
    }

    if (event.key == "o") {
		if (i < sphereArray.length) {
			s.material.color.setHex(0xff0000);
			i++;
		}

		// draw line from s to new sphere
		let x1 = s.position.x;
		let y1 = s.position.y;
		let z1 = s.position.z;

		// let theta = boom.rotation.y;
		// let phi = boom.rotation.x;

		// let x2 = boomLength * Math.sin(phi) * Math.sin(theta);
		// let z2 = boomLength * Math.cos(phi);
		// let y2 = boomLength * Math.sin(phi) * Math.cos(theta);

		// console.log("x2:", x2, "y2:", y2, "z2:", z2);

		updateCameraPosition();

		let x3 = vector.x;
		let y3 = vector.y;
		let z3 = vector.z;

		// draw a sphere at x2, y2, z2
		// drawSphere(x2, y2, z2, 0x0000ff, 5);

		// draw sphere on line that is closer
		drawSphere(x3, y3, z3, 0x00ff00, 5);

		// Calculate the direction vector between the two points
		const direction = new THREE.Vector3(
			x3,
			y3,
			z3
		).normalize();

		// Calculate the position of the sphere based on the distance and direction
		const spherePosition = new THREE.Vector3(0,0,0).add(
			direction.clone().multiplyScalar(200)
        );
        
        // draw a sphere at the new position
        drawSphere(spherePosition.x, spherePosition.y, spherePosition.z, 0x00ffff, 5);

		// draw a line from x1, y1, z1 to x2, y2, z2
		// drawLine(x1, y1, z1, x2, y2, z2);
		drawLine(
			x1,
			y1,
			z1,
			spherePosition.x,
			spherePosition.y,
			spherePosition.z
		);
	}
    
});

function drawLine(x1, y1, z1, x2, y2, z2) {
    const direction = new THREE.Vector3(
        x2 - x1,
        y2 - y1,
        z2 - z1
    ).normalize();

    // Define a sufficiently large distance to extend the line
    const distance = 1000; // Adjust this as needed

    // Calculate the new end points for the infinite line
    const newEndPoint1 = new THREE.Vector3(x1, y1, z1).sub(
        direction.clone().multiplyScalar(distance)
    );
    const newEndPoint2 = new THREE.Vector3(x2, y2, z2).add(
        direction.clone().multiplyScalar(distance)
    );

    // Create a line geometry using the new end points
    const geometry = new THREE.BufferGeometry().setFromPoints([
        newEndPoint1,
        newEndPoint2,
    ]);

    // Create a line material and add the line to the scene
    const line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 100 })
    );
    scene.add(line);
}

function drawDot(x, y, radius, color) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.closePath();
}