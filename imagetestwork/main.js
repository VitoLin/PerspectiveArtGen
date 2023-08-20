//codepen.io/xiadd/pen/mdyEQVb

var canvas = document.getElementsByTagName("canvas")[0];
var ctx = canvas.getContext("2d");

var canvas2 = document.getElementById("canvas2");
var ctx2 = canvas2.getContext("2d");

trackTransforms(ctx);

// Get the image data
var img = new Image();
let imageData = ctx2.getImageData(0, 0, canvas.width, canvas.height);
let data = imageData.data;

var img2 = new Image();


function createImage() {
    console.log("createImage Test");
    ctx2.clearRect(0, 0, canvas.width, canvas.height);
    ctx2.drawImage(img, 0, 0, img.width, img.height);
    
	// draw over the image
	// Get the image data
	imageData = ctx2.getImageData(0, 0, img.width, img.height);
	data = imageData.data;

	// Apply threshold to the image data
	for (let i = 0; i < data.length; i += 4) {
		const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
		const newValue = avg >= thresholdValue ? 255 : 0;
		data[i] = newValue;
		data[i + 1] = newValue;
		data[i + 2] = newValue;
	}

	// Put the modified image data back to the canvas
	ctx2.putImageData(imageData, 0, 0);

	// draw the image on the second canvas
    img2.src = canvas2.toDataURL();
    img2.width = img.width;
    img2.height = img.height;
    
	
}

function redraw() {
	
    createImage();
    img2.onload = function () {
		// Clear the entire canvas
		var p1 = ctx.transformedPoint(0, 0);
		var p2 = ctx.transformedPoint(canvas.width, canvas.height);
		ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.restore();

		ctx.drawImage(
			img2,
			canvas.width / 2 - img2.width / 2,
			canvas.height / 2 - img2.height / 2
		);
	}
}

// File upload
imageInput.addEventListener("change", function (event) {
	const file = event.target.files[0];
	img.src = URL.createObjectURL(file);

	img.onload = function () {
		textInputWidth.value = img.width;
		textInputHeight.value = img.height;
		redraw();
	};
});

// Scroll and zoom
var lastX = canvas.width / 2,
	lastY = canvas.height / 2;

var dragStart, dragged;

canvas.addEventListener(
	"mousedown",
	function (evt) {
		document.body.style.mozUserSelect =
			document.body.style.webkitUserSelect =
			document.body.style.userSelect =
				"none";
		lastX = evt.offsetX || evt.pageX - canvas.offsetLeft;
		lastY = evt.offsetY || evt.pageY - canvas.offsetTop;
		dragStart = ctx.transformedPoint(lastX, lastY);
		dragged = false;
	},
	false
);

canvas.addEventListener(
	"mousemove",
	function (evt) {
		lastX = evt.offsetX || evt.pageX - canvas.offsetLeft;
		lastY = evt.offsetY || evt.pageY - canvas.offsetTop;
		dragged = true;
		if (dragStart) {
			var pt = ctx.transformedPoint(lastX, lastY);
			ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
			redraw();
		}
	},
	false
);

canvas.addEventListener(
	"mouseup",
	function (evt) {
		dragStart = null;
		if (!dragged) zoom(evt.shiftKey ? -1 : 1);
	},
	false
);

var scaleFactor = 1.1;

var zoom = function (clicks) {
	var pt = ctx.transformedPoint(lastX, lastY);
	ctx.translate(pt.x, pt.y);
	var factor = Math.pow(scaleFactor, clicks);
	ctx.scale(factor, factor);
	ctx.translate(-pt.x, -pt.y);
	redraw();
};

var handleScroll = function (evt) {
	var delta = evt.wheelDelta
		? evt.wheelDelta / 40
		: evt.detail
		? -evt.detail
		: 0;
	if (delta) zoom(delta);
	return evt.preventDefault() && false;
};

canvas.addEventListener("DOMMouseScroll", handleScroll, false);
canvas.addEventListener("mousewheel", handleScroll, false);

// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
function trackTransforms(ctx) {
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	var xform = svg.createSVGMatrix();
	ctx.getTransform = function () {
		return xform;
	};

	var savedTransforms = [];
	var save = ctx.save;
	ctx.save = function () {
		savedTransforms.push(xform.translate(0, 0));
		return save.call(ctx);
	};

	var restore = ctx.restore;
	ctx.restore = function () {
		xform = savedTransforms.pop();
		return restore.call(ctx);
	};

	var scale = ctx.scale;
	ctx.scale = function (sx, sy) {
		xform = xform.scaleNonUniform(sx, sy);
		return scale.call(ctx, sx, sy);
	};

	var rotate = ctx.rotate;
	ctx.rotate = function (radians) {
		xform = xform.rotate((radians * 180) / Math.PI);
		return rotate.call(ctx, radians);
	};

	var translate = ctx.translate;
	ctx.translate = function (dx, dy) {
		xform = xform.translate(dx, dy);
		return translate.call(ctx, dx, dy);
	};

	var transform = ctx.transform;
	ctx.transform = function (a, b, c, d, e, f) {
		var m2 = svg.createSVGMatrix();
		m2.a = a;
		m2.b = b;
		m2.c = c;
		m2.d = d;
		m2.e = e;
		m2.f = f;
		xform = xform.multiply(m2);
		return transform.call(ctx, a, b, c, d, e, f);
	};

	var setTransform = ctx.setTransform;
	ctx.setTransform = function (a, b, c, d, e, f) {
		xform.a = a;
		xform.b = b;
		xform.c = c;
		xform.d = d;
		xform.e = e;
		xform.f = f;
		return setTransform.call(ctx, a, b, c, d, e, f);
	};

	var pt = svg.createSVGPoint();
	ctx.transformedPoint = function (x, y) {
		pt.x = x;
		pt.y = y;
		return pt.matrixTransform(xform.inverse());
	};
}

// Buttons
resizeButton.addEventListener("click", function () {
	img.width = textInputWidth.value;
	img.height = textInputHeight.value;
	redraw();
});
resetButton.addEventListener("click", function () {
	img.width = img.naturalWidth;
	textInputWidth.value = img.width;
	img.height = img.naturalHeight;
	textInputHeight.value = img.height;
	redraw();
});

// Set up the threshold slider and event handler
let thresholdValue = 128;

const thresholdSlider = document.getElementById("slider");
const thresholdValueText = document.getElementById("sliderValue");

thresholdSlider.addEventListener("input", function (event) {
	thresholdValue = parseInt(event.target.value);
	thresholdValueText.textContent = thresholdValue;
	redraw();
});

download.addEventListener("click", function () {
	if (imageData) {
		const json = generateBinaryMatrix(imageData);
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "thresholded_image.json";
		a.click();
	}
});

function generateJSON(imageData) {
	const matrix = [];
	for (let y = 0; y < imageData.height; y++) {
		const row = [];
		for (let x = 0; x < imageData.width; x++) {
			const index = (y * imageData.width + x) * 4;
			const pixel = {
				r: imageData.data[index],
				g: imageData.data[index + 1],
				b: imageData.data[index + 2],
			};
			row.push(pixel);
		}
		matrix.push(row);
	}
	return JSON.stringify(matrix);
}

function generateBinaryMatrix(imageData, threshold) {
	const matrix = [];
	for (let y = 0; y < imageData.height; y++) {
		const row = [];
		for (let x = 0; x < imageData.width; x++) {
			const index = (y * imageData.width + x) * 4;
			const avg =
				(imageData.data[index] +
					imageData.data[index + 1] +
					imageData.data[index + 2]) /
                3;
			const pixelValue = avg > 0 ? 0 : 1;
			row.push(pixelValue);
		}
		matrix.push(row);
	}
	return JSON.stringify(matrix);
}