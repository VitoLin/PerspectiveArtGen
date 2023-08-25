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
const renderer = new THREE.WebGLRenderer({canvas: threeCanvas});
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

// set up light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLight);
updateLight();






// Animation loop
function animate() {
    updateLight();
    requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

// Initialization
let image1;
let image2;
let image3;
function initialize() {
	// Load images
	// Images and function to run when images are loaded
	fetch("images.json")
		.then((response) => response.json())
		.then((jsonData) => {
			image1 = jsonData.one;
			image2 = jsonData.two;
			image3 = jsonData.three;

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

// Add initial objects
drawSphere(0, 0, 0, 0x000000, 10);



// Logic
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

// Keyboard input
let sphereArray = [];
document.addEventListener("keydown", function (event) {
    // Log the key code and key character to the console
    console.log("Key pressed:", event.key);

    // Rotate the boom to the x y z faces NEEDS UPDATE
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
    
    // let s = sphereArray[0];
    // // Log some information
    if (event.key == "p") {
        // console.log("sphere:", s.position.x, s.position.y, s.position.z);
        console.log("camera:", camera.position.x, camera.position.y, camera.position.z);
        console.log("boom:", boom.rotation.x * 180 / Math.PI, boom.rotation.y * 180 / Math.PI, boom.rotation.z * 180 / Math.PI);
        let viewPosition = getViewCoordinates();
        console.log("view:", viewPosition.x, viewPosition.y, viewPosition.z);
    }

    // Test perspective sphere
    if (event.key == "o") {
        sphereArray.forEach((sphere) => {
            let distance = Math.random() * 400 - 200;
            drawPerspectiveSphere(
				sphere,
				0x0000ff,
				distance,
                sphere.geometry.parameters.radius,
                true
			);
        });
    }

    // Hide image reference
    if (event.key == "h") {
        hideImage();
    }


    // Create plane
    if (event.key == "c") {
		let plane = createViewPlane(50, 100, 100, 0x00ff00);

		// Get normal and point on plane
		let viewPosition = getViewCoordinates();
		let normal = getDirection(
			0,
			0,
			0,
			viewPosition.x,
			viewPosition.y,
			viewPosition.z
		);
		let pointOnPlane = plane.position;

		// Draw line from point on plane to view position
		drawLine(
			pointOnPlane.x,
			pointOnPlane.y,
			pointOnPlane.z,
			viewPosition.x,
			viewPosition.y,
			viewPosition.z
		);
		drawSphere(pointOnPlane.x, pointOnPlane.y, pointOnPlane.z, 0x0000ff, 5);

		// Get the equations
		// Calculate the constant term 'D' using the formula Ax + By + Cz = D
		const D = normal.dot(pointOnPlane);
		const equation = `${normal.x}x + ${normal.y}y + ${normal.z}z = ${D}`;

        console.log("Equation of the Plane:", equation);

        
    }
    
    // Draw square of spheres
    if (event.key == "l") {
		sphereArray = drawSquare(20, 10, 5, 0x00ff00);

        sphereArray.forEach((sphere) => {
            sphere.position.applyQuaternion(boom.quaternion);

        });
	}

});

// Draw square of spheres
function drawSquare(size, spacing, radius, color) {
    let sphereArray = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0;j < size;j++) {
            if (image1[i][j] == 1) {
            sphereArray.push(
				drawSphere(
					(i - (size - 1) / 2) * spacing,
					(j - (size - 1) / 2) * spacing,
					0,
					color,
					radius
				)
			);
                
            }
        }
    }
    return sphereArray;
}



// Functions
// Get coordinates to camera and put it in cameraPositionVector
function updateCameraPosition() {
	camera.updateMatrixWorld(); //Update the camera location
	cameraPositionVector = camera.position.clone(); //Get camera position and put into variable
	cameraPositionVector.applyMatrix4(camera.matrixWorld); //Hold the camera location in matrix world
}

// Update light position based on vector
function setLightPosition(vector) {
    directionalLight.position.set(vector.x, vector.y, vector.z);
}

// Update light position based on camera position
function updateLight() {
    updateCameraPosition();
    setLightPosition(cameraPositionVector);
}

// Draw sphere at x, y, z with color and radius
function drawSphere(x, y, z, color, radius) {
	const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
	const sphereMaterial = new THREE.MeshLambertMaterial({
		color: color,
	});
	const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

	// Draw sphere at x, y, z
	sphere.position.set(x, y, z);

    scene.add(sphere);

    return sphere;
}

// Get distance between two points
function getDistance(x1, y1, z1, x2, y2, z2) {
	const distance = Math.sqrt(
		(x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2
	);
	return distance;
}

// Maintain relative size of sphere with distance
function getPerspectiveScaledSize(originalDistance, newDistance, size) {
	return (newDistance / originalDistance) * size;
}

// Get coordinates of point from x, y, z in direction with scale 
// Helper for posFromPoint
function transformCoordinates(x, y, z, direction, scale) {
	const newPoint = new THREE.Vector3(x, y, z).add(
		direction.clone().multiplyScalar(scale)
	);
	return newPoint;
}

// Get position of point on line from x1, y1, z1 to x2, y2, z2 at dist from x1, y1, z1
function posFromPoint(x1, y1, z1, x2, y2, z2, dist) {
	const direction = getDirection(x1, y1, z1, x2, y2, z2);
	const position = transformCoordinates(x1, y1, z1, direction, dist);
	return position;
}

// Coordinates of view instead of camera
function getViewCoordinates() {
	updateCameraPosition();
	return posFromPoint(0, 0, 0, cameraPositionVector.x, cameraPositionVector.y, cameraPositionVector.z, boomLength);
}

// Get direction from x1, y1, z1 to x2, y2, z2
function getDirection(x1, y1, z1, x2, y2, z2) {
	const direction = new THREE.Vector3(x2 - x1, y2 - y1, z2 - z1).normalize();
	return direction;
}

// Draw line from x1, y1, z1 to x2, y2, z2
// Old and missing ability to edit distance and color 
function drawLine(x1, y1, z1, x2, y2, z2) {
	const direction = getDirection(x1, y1, z1, x2, y2, z2);

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
		new THREE.LineBasicMaterial({ color: 0x0000ff})
	);
    scene.add(line);
    
    return line;
}

// Draw sphere on view position
function drawViewSphere() {
	let viewPosition = getViewCoordinates();
	drawSphere(viewPosition.x, viewPosition.y, viewPosition.z, 0x00ffff, 5);
}

// Draw sphere so that it maintains its size relative to the current view position
function drawPerspectiveSphere(sphere, color, distance, radius, viewInfo = false) {
	// position of s
	let x1 = sphere.position.x;
	let y1 = sphere.position.y;
	let z1 = sphere.position.z;

	// draw sphere on view position
	let viewPosition = getViewCoordinates();

	// draw a line from sphere to view position
	if (viewInfo) {
		drawViewSphere();
		drawLine(x1, y1, z1, viewPosition.x, viewPosition.y, viewPosition.z);
	}

	// draw a sphere on the line from s to view position at dist
	const pos = posFromPoint(
		x1,
		y1,
		z1,
		viewPosition.x,
		viewPosition.y,
		viewPosition.z,
		distance
	);

	// viewPosition = vector;
	// set the size of the radius of the sphere so that it looks like the same size as s despite changing its distance
	const originalDistance = getDistance(
		x1,
		y1,
		z1,
		viewPosition.x,
		viewPosition.y,
		viewPosition.z
	);
	const newDistance = getDistance(
		pos.x,
		pos.y,
		pos.z,
		viewPosition.x,
		viewPosition.y,
		viewPosition.z
	);

	const newRadius = getPerspectiveScaledSize(
		originalDistance,
		newDistance,
		radius
	);

	return drawSphere(pos.x, pos.y, pos.z, color, newRadius);
}

// Draw plane at x, y, z with width, height, and color
function drawPlane(x, y, z, width, height, color) {
	const planeGeometry = new THREE.PlaneGeometry(width, height); // Adjust the size as needed

	// Create a material for the plane
	const planeMaterial = new THREE.MeshBasicMaterial({
		color: color,
		side: THREE.DoubleSide,
	});

	// Create a mesh using the geometry and material
	const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

	planeMesh.position.set(x, y, z);

	// Add the mesh to the scene
	scene.add(planeMesh);

	// Apply the rotation to the plane
    planeMesh.rotation.copy(boom.rotation);
    
    return planeMesh;
}

// Cretae a plane at a distance from the origin
function createViewPlane(distance, width, height, color) {
    let viewPosition = getViewCoordinates();
    let closerPos = posFromPoint(
        0,
        0,
        0,
        viewPosition.x,
        viewPosition.y,
        viewPosition.z,
        distance
    );

    return drawPlane(
        closerPos.x,
        closerPos.y,
        closerPos.z,
        width,
        height,
        color
    );

}





// Hides the image
function hideImage() {
	sphereArray.forEach((sphere) => {
		if (sphere.visible) {
			sphere.visible = false;
		} else {
			sphere.visible = true;
		}
	});
}






