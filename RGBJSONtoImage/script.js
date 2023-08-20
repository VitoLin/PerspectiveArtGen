// script.js

document.addEventListener("DOMContentLoaded", () => {
	const jsonInput = document.getElementById("json-input");
	const loadButton = document.getElementById("load-button");
	const outputCanvas = document.getElementById("output-canvas");

	let loadedImageData = null;

	jsonInput.addEventListener("change", (event) => {
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.onload = (event) => {
			loadedImageData = JSON.parse(event.target.result);
		};
		reader.readAsText(file);
	});

	loadButton.addEventListener("click", () => {
		if (loadedImageData) {
			generateImage2(loadedImageData);
		}
	});

	function generateImage(imageData) {
		if (!imageData || !Array.isArray(imageData)) {
			return;
		}

		const canvas = document.createElement("canvas");
		canvas.width = imageData[0].length;
		canvas.height = imageData.length;
		const context = canvas.getContext("2d");

		for (let y = 0; y < imageData.length; y++) {
			for (let x = 0; x < imageData[y].length; x++) {
				const pixel = imageData[y][x];
				const color = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
				context.fillStyle = color;
				context.fillRect(x, y, 1, 1);
			}
		}

		outputCanvas.width = canvas.width;
		outputCanvas.height = canvas.height;
		const outputContext = outputCanvas.getContext("2d");
		outputContext.drawImage(canvas, 0, 0);
    }
    
    function generateImage2(binaryMatrix) {
		if (!Array.isArray(binaryMatrix)) {
			return;
		}

		const canvas = document.createElement("canvas");
		canvas.width = binaryMatrix[0].length;
		canvas.height = binaryMatrix.length;
		const context = canvas.getContext("2d");

		for (let y = 0; y < binaryMatrix.length; y++) {
			for (let x = 0; x < binaryMatrix[y].length; x++) {
				const pixelValue = binaryMatrix[y][x];
				const color = pixelValue === 0 ? "white" : "black"; // Set colors based on binary values
				context.fillStyle = color;
				context.fillRect(x, y, 1, 1);
			}
		}

		outputCanvas.width = canvas.width;
		outputCanvas.height = canvas.height;
		const outputContext = outputCanvas.getContext("2d");
		outputContext.drawImage(canvas, 0, 0);
	}

});
