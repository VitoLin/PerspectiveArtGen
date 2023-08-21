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
camera.position.set(0, 0, 200); // this sets the boom's length
camera.lookAt(0, 0, 0); // camera looks at the boom's zero

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
camera.updateMatrixWorld(); //Update the camera location
let vector = camera.position.clone(); //Get camera position and put into variable
vector.applyMatrix4(camera.matrixWorld); //Hold the camera location in matrix world
directionalLight.position.set(vector.x, vector.y, vector.z);

scene.add(directionalLight);

// Functions
function toScreenPosition(obj, camera)
{
    var vector = new THREE.Vector3();

    var widthHalf = 0.5 * renderer.getContext().canvas.width;
    var heightHalf = 0.5 * renderer.getContext().canvas.height;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - (vector.y * heightHalf) + heightHalf;

    return { 
        x: vector.x,
        y: vector.y
    };

};

function toWorldPosition(screenX, screenY, camera) {
    var vector = new THREE.Vector3();
    
    camera.updateMatrixWorld(); 

	var widthHalf = 0.5 * renderer.getContext().canvas.width;
    var heightHalf = 0.5 * renderer.getContext().canvas.height;
    

	vector.x = (screenX - widthHalf) / widthHalf;
	vector.y = -(screenY - heightHalf) / heightHalf;
	vector.z = -1; // Assuming z is in the range of [0, 1]

	vector.unproject(camera);

    return {
        x: vector.x,
        y: vector.y,
        z: vector.z
    }
}


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

	camera.updateMatrixWorld(); //Update the camera location
	vector = camera.position.clone(); //Get camera position and put into variable
	vector.applyMatrix4(camera.matrixWorld); //Hold the camera location in matrix world
	directionalLight.position.set(vector.x, vector.y, vector.z);
});

// Render
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
        by += Math.PI / 2;
    }
    if (event.key == "d") {
        by -= Math.PI / 2;

    }
    if (event.key == "s") {
        bx -= Math.PI / 2;
    }
    if (event.key == " ") {
        bx = 0;
        by = 0;
        bz = 0;
    }

    boom.rotation.set(bx, by, bz);
    
    // Log sphere positions
    if (event.key == "p") {
        console.log(sphereMatrix);
    }
    if (event.key == "o") {
        let s = sphereArray[i];
        if (i < sphereArray.length) {
            s.material.color.setHex(0xff0000);
            // i++;
        }

        let { x, y } = toScreenPosition(s, camera);

        let { x: x2, y: y2, z: z2 } = toWorldPosition(x, y, camera);
        addSphere(x2, y2, z2, 0x00ff00, 3);
        console.log(x2, y2, z2);

        // draw line from s to new sphere
        let x1 = s.position.x;
        let y1 = s.position.y;
        let z1 = s.position.z;
        const points = [];
		points.push(new THREE.Vector3(x1, y1, z1));
		points.push(new THREE.Vector3(x2, y2, z2));

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x0000ff }));
        scene.add(line);
        

        // add a 2d dot to the screen
        drawDot(x, y, 6, "red");

        
    }
    
});

function drawDot(x, y, radius, color) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.closePath();
}