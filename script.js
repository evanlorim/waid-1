// The top and bottom waves on the screen are always perlin noise waves (The alpha and omega wave in the code). As you go up the screen from the bottom - alpha - wave each wave gets closer and closer to the top - omega - wave. They are interpolations of the generations between the alpha and omega wave -- and as such are kind of like an evolution. This program is an attempt to digitally recreate a motif I use in many of my drawings, such as this one: https://drive.google.com/open?id=0B8wt4wA78whIV3JRZV9KTDRhX1U

// t, x, y and n are defined as in here: https://www.khanacademy.org/computing/computer-programming/programming-natural-simulations/programming-noise/a/perlin-noise
// slice is the space alloted for each wave.

// Have fun playing around!

// options for user to modify.
var options = {
	width: 1080,
	height: 600,
	tIncrement: 1,
	xIncrement: 0.05,
	yIncrement: 0.01,
	sliceIncrement: 200,
	alphaOmegaDifference: 1000000,
	frameRate: 60,
	bgColor: "#37474f",
	strokeColor: "#ffffff",
	strokeWeight: 1
};

//options that adjust the interface -- user doesn't modify
var config = {
	inputPadding: 40,
	sliderGap: 50,
	tUpper: 10,
	tLower: .1,
	xLower: .001,
	xUpper: .2,
	yLower: .00,
	yUpper: .2,
	sliceLower: 25,
	sliceUpper: 400
};


var tSlider, xSlider, ySlider, sliceSlider;
var tText, xText, yText, sliceText;
var y = 0.0;

function setup() {
	createCanvas(options.width, options.height);
	frameRate(options.frameRate);
	textSize(15);

	tSlider = createSlider(config.tLower*1000, config.tUpper*1000, options.tIncrement*1000);
	tSlider.position(config.inputPadding, options.height + config.inputPadding + (config.sliderGap*0));

	xSlider = createSlider(config.xLower*1000, config.xUpper*1000, options.xIncrement*1000);
	xSlider.position(config.inputPadding, options.height + config.inputPadding + (config.sliderGap*1));

	ySlider = createSlider(config.yLower*1000, config.yUpper*1000, options.yIncrement*1000);
	ySlider.position(config.inputPadding, options.height + config.inputPadding + (config.sliderGap*2));

	sliceSlider = createSlider(config.sliceLower, config.sliceUpper, options.sliceIncrement);
	sliceSlider.position(config.inputPadding, options.height + config.inputPadding + (config.sliderGap*3));

	var sliderOffset = config.inputPadding + 131 + config.inputPadding;

	tText = createDiv("t increment (min: " + config.tLower + ", max: " + config.tUpper + ")");
	tText.position(sliderOffset, options.height + config.inputPadding + (config.sliderGap*0));

	xText = createDiv("x increment (min: " + config.xLower + ", max: " + config.xUpper + ")");
	xText.position(sliderOffset, options.height + config.inputPadding + (config.sliderGap*1));

	yText = createDiv("y increment (min: " + config.yLower + ", max: " + config.yUpper + ")");
	yText.position(sliderOffset, options.height + config.inputPadding + (config.sliderGap*2));

	sliceText = createDiv("Slice increment (min: " + config.sliceLower + ", max: " + config.sliceUpper + ")");
	sliceText.position(sliderOffset, options.height + config.inputPadding + (config.sliderGap*3));
}

function draw() {
	options = updateOptions();
	var sliceBounds = getSliceBounds();
	background(options.bgColor);
	var alphaWave = getWave();
	var omegaWave = getWave(options.alphaOmegaDifference);
	var differences = subtractWaves(alphaWave, omegaWave);
	var factor = 0;
	_.forEach(sliceBounds, (s, i) => {
		if ( (i-1) > 0) {
			factor = (i / sliceBounds.length);
		}
		var deltaWave = multiplyWave(differences, factor);
		var addedWave = addWaves(alphaWave, deltaWave);
		var wave = mapWave(addedWave, s.lower, s.upper);
		drawWave(wave);
	});
}

function getSliceBounds() {
	var sliceBounds = [];
	var lower = 0;
	for (var upper = options.sliceIncrement; upper <= options.height; upper+= options.sliceIncrement) {
		sliceBounds.push({upper, lower});
		lower+= options.sliceIncrement;
	}
	if (lower < options.height && upper > options.height) {
		sliceBounds.push({lower, upper: options.height});
	}
	return sliceBounds;
}

function getWave(yOffset = 0) {
	var x = 0;
	wave = [];
	for (var t = 0; t <= options.width; t+= options.tIncrement) {
		var n = noise(x, y + yOffset);
		wave.push({t, n});
		x += options.xIncrement;
	}
	y += options.yIncrement;
	return wave;
}

function mapWave(wave, lowerBound, upperBound) {
	return _.map(wave, w => {
		var t = w.t;
		var n = map(w.n, 0, 1, lowerBound, upperBound);
		return {t, n};
	});
}

function subtractWaves(wave1, wave2) {
	return  _.map(wave1, (w1, i) => {
		var t = w1.t;
		var n = wave2[i].n - w1.n;
		return {t, n};
	});
}

function addWaves(wave1, wave2) {
	return _.map(wave1, (w1, i) => {
		var t = w1.t;
		var n = wave2[i].n + w1.n;
		return {t, n};
	})
}

function multiplyWave(wave, factor) {
	return _.map(wave, w => {
		t = w.t;
		var n = w.n * factor;
		return {t, n};
	});
}

function drawWave(wave) {
	noFill();
	stroke(options.strokeColor);
	strokeWeight(options.strokeWeight);
	beginShape();
	_.forEach(wave, w => {
		vertex(w.t, w.n);
	});
	endShape();
}

function drawLine(h) {
	line(0,h,options.width,h);
}

function updateOptions() {
	options.tIncrement = tSlider.value() / 1000;
	options.xIncrement = xSlider.value() / 1000;
	options.yIncrement = ySlider.value() / 1000;
	options.sliceIncrement = sliceSlider.value();
	return options;
}
