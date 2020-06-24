# Interpolation

## Ranges

`color.range()` and `Color.range()` are at the core of Color.js’ interpolation engine.
They give you a function that accepts a  number and returns a color.
For numbers in the range 0 to 1, the function _interpolates_; for numbers outside that range, the function _extrapolates_ (and thus, may not return the results you expect):

```js
	let color = new Color("p3", [0, 1, 0]);
	let redgreen = color.range("red", {
		space: "lch", // interpolation space
		outputSpace: "srgb"
	});
	redgreen(.5); // midpoint
```

Percentages (0 to 100%) should be converted to numbers (0 to 1).

The `space` parameter controls the [color space](spaces.html)
interpolation occurs in, and defaults to Lab.
Colors do not need to be in that space, they will be converted for interpolation.
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

Note that for color spaces with a hue angle there are multiple ways to interpolate, which can produce drastically different results.
The `hue` argument is inspired by [the hue-adjuster in CSS Color 5](https://drafts.csswg.org/css-color-5/#hue-adjuster).

```js
let c1 = new Color("rebeccapurple");
c1.lch;
let c2 = new Color("lch", [85, 85, 85 + 720]);
c1.range(c2, {space: "lch", hue: "longer"});
c1.range(c2, {space: "lch", hue: "shorter"});
c1.range(c2, {space: "lch", hue: "increasing"});
c1.range(c2, {space: "lch", hue: "decreasing"});
c1.range(c2, {space: "lch", hue: "raw"});
c1.range(c2, {space: "lch"}); // default is "shorter"
```

Range interpolates between colors as they were at the time of its creation.
If you change the colors afterwards, the range will not be affected:

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
		maxDeltaE: 3, // max deltaE between consecutive steps (optional)
		steps: 10 // min number of steps
	});
```

By default, the deltaE76 function is used.

## Mixing colors

Interpolation can be used to create color mixtures,
in any desired proportion,
between two colors.

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
