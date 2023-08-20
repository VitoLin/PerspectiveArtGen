// https://fontmeme.com/pixel-fonts/
const Jimp = require("jimp");
const fs = require("fs");

const imagePath = "vito.png"; // Replace with the actual path to your image
const outputImagePath = "output.png";

const threshold = 128; // Adjust the threshold value (0 to 255)

Jimp.read(imagePath)
    .then((image) => {
		image.resize(40, 40);
		const width = image.bitmap.width;
		const height = image.bitmap.height;

		const bitmapData = new Uint8Array(width * height);

		image.scan(0, 0, width, height, (x, y, idx) => {
			const grayscaleValue =
				(image.bitmap.data[idx] +
					image.bitmap.data[idx + 1] +
					image.bitmap.data[idx + 2]) /
				3;
			image.bitmap.data[idx] = grayscaleValue; // Red
			image.bitmap.data[idx + 1] = grayscaleValue; // Green
			image.bitmap.data[idx + 2] = grayscaleValue; // Blue
		});

		const data = image.data;

		// Convert the pixel data to a JSON object
		const jsonData = {
			width: width,
			height: height,
			pixels: bitmapData,
		};

		// Convert the JSON object to a JSON string
		const jsonString = JSON.stringify(jsonData);

		// Write the JSON string to the file
		fs.writeFile("output.json", jsonString, "utf8", (err) => {
			if (err) {
				console.error("Error writing JSON file:", err);
			} else {
				console.log("JSON file saved:", "output.json");
			}
		});

		// Now `bitmapData` contains the bitmap representation of the image
		console.log(bitmapData);

		return image.write(outputImagePath);
	})
	.catch((error) => {
		console.error(error);
	});
