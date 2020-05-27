# Interpolation

## Ranges

`color.range()` and `Color.range()` are at the core of Color.js’ interpolation engine.
They give you a function that accepts a percentage as a 0 - 1 number:

```js
	let color = new Color("p3", [0, 1, 0]);
	let redgreen = color.range("red", {
		space: "lch", // interpolation space
		outputSpace: "srgb"
	});
	redgreen(.5); // midpoint
```

The `space` parameter controls the color space interpolation occurs in and defaults to Lab.
The interpolation space can make a big difference in the result:

```js
let c1 = new Color("rebeccapurple");
let c2 = new Color("lch", [85, 100, 85]);
c1.range(c2); // lab
c1.range(c2, {space: "lch"});
c1.range(c2, {space: "srgb"}); // gamma corrected sRGB
c1.range(c2, {space: "xyz"}); // XYZ, same result as linear RGB
c1.range(c2, {space: "hsl"});
c1.range(c2, {space: "hwb"});
```

Range interpolates between colors as they were at the time of its creation.
If you change the colors afterwards, it will not be affected:

```js
	let color = new Color("red");
	let color2 = new Color("black");
	let gradient = color.range(color2);
	color.coords[1] = 1;
	color2.coords[2] = 1;
	gradient(.5);
	gradient = color.range(color2);
	gradient(.5);
```

Interpolating between a coordinate and `NaN` keeps that coordinate constant.
This is useful for achromatic transitions:

```js
let lime = new Color("p3", [0, 1, 0]);
let white = new Color("lch", [100, 0, 0]);
let white2 = new Color("lch", [100, 0, NaN]);
let limewhite = lime.range(white, {space: "lch"});
let limewhite2 = lime.range(white2, {space: "lch"});

// Two kinds of fade out to transparent
lime.range(new Color("transparent"));
lime.range(new Color(lime.space, [NaN, NaN, NaN], 0), {space: lime.space});
```

You can use the `progression` parameter to customize the progression and make it non-linear:
```js
	let r = new Color("lch(50 50 0)").range("lch(90 50 20)");
	Color.range(r, {progression: p => p ** 3});
```

Note that you can use `Color.range(rangeFunction)` to modify a range after it has been created, as you can see in the example above.
This produces a new range, and leaves the old one unaffected.

## Interpolation by discrete steps

`color.steps()` and `Color.steps()` give you an array of discrete steps.

```js
	let color = new Color("p3", [0, 1, 0]);
	color.steps("red", {
		space: "lch",
		outputSpace: "srgb",
		delta: 3, // max deltaE between consecutive steps (optional)
		steps: 10 // min number of steps
	});
```

## Mixing colors

Shortcut for specific points in the range:
```js
	let color = new Color("p3", [0, 1, 0]);
	let redgreen = color.mix("red", .5, {space: "lch", outputSpace: "srgb"});
	let reddishGreen = color.mix("red", .25, {space: "lch", outputSpace: "srgb"});
```

Static syntax, for one-off mixing:
```js
	Color.mix("color(display-p3 0 1 0)", "red", .5);
```
