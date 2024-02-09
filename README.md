<header class="readme-only">

# Color.js: Let’s get serious about color

[![Netlify Status](https://api.netlify.com/api/v1/badges/a6208d72-3d48-43ab-9132-b9f31f828609/deploy-status)](https://app.netlify.com/sites/colorjs/deploys)
[![npm](https://img.shields.io/npm/dw/colorjs.io)](https://npmjs.com/package/colorjs.io)

[Official website](https://colorjs.io) • [Contribution guide](CONTRIBUTING.md)

Color.js is a color conversion and modification library originally created by two of the editors of the CSS Color specifications: Lea Verou and Chris Lilley.
They continue to work on it, but are also joined by an exceptional small grassroots team of co-maintainers.

## Features

- **Color space agnostic**: Each color object is basically a list of coords and a color space reference. Operations are color space agnostic.
Modules for <a href="https://colorjs.io/docs/spaces.html">a wide variety of color spaces</a>,
including Lab/LCh, OKLab/OKLCh,
sRGB and friends (HSL/HSV/HWB), Display P3,
J<sub>z</sub>a<sub>z</sub>b<sub>z</sub>, REC.2100 and many <a href="https://colorjs.io/docs/spaces.html">more</a>.
- **Doesn't gloss over color science**: Actual <a href="docs/gamut-mapping.html">gamut mapping</a> instead of naïve clipping,
multiple <a href="https://colorjs.io/docs/color-difference.html">DeltaE</a> methods (76, CMC, 2000, J<sub>z</sub>),
multiple <a href="https://colorjs.io/docs/adaptation.html">chromatic adaptation</a> methods (von Kries, Bradford, CAT02, CAT16),
all with sensible defaults
- **Up to date with CSS Color 4**: Every <a href="https://drafts.csswg.org/css-color-4/">CSS Color 4</a> format & color space supported for both <a href="docs/the-color-object.html">input</a> and <a href="https://colorjs.io/docs/output.html">output</a>, whether your browser supports it or not.
- **Readable, object-oriented API**: Color objects for multiple operations on the same color, and static `Color.something()` functions for one-off calculations
- **Modular & Extensible**: Use only what you need, or a bundle. Client-side or Node. Deep extensibility with <a href="https://colorjs.io/api/#Hooks-hooks.js">hooks</a>.
- **Fast & efficient**: <a href="https://colorjs.io/docs/procedural.html">Procedural, tree-shakeable API</a> available for performance sensitive tasks and reduced bundle size

</header>

<section>
	
## Impact

- Has been used to create demos for several W3C specifications
- Has been used by browsers to test their CSS Color 4/5 implementations
- Over [2 million total npm downloads](https://limonte.dev/total-npm-downloads/?package=colorjs.io)!
- Used by several [high impact projects](https://www.npmjs.com/browse/depended/colorjs.io), including [Sass](https://sass-lang.com/), [Open Props](https://open-props.style/), [axe](https://www.deque.com/axe/) accessibility testing engine, and [OddContrast](https://www.oddcontrast.com/) and [CSS HD Gradients](https://gradient.style/) color tools
- Parts of Color.js’s API are used as a testing ground for the design of a [native `Color` object for the Web platform](https://github.com/wicg/color-api).

</section>

<section class="cn-ignore">

## Installation

Color.js is designed make simple things easy, and complex things possible, and that extends to installation as well.

For quick experiments, you can just import Color.js directly from the CDN (kindly provided by the awesome folks at [Netlify](https://netlify.com)) with all modules included:

```js
import Color from "https://colorjs.io/dist/color.js";
```

You can also install via npm if you’d prefer:

```
npm install colorjs.io
```

Whether you’re using NPM, the CDN, or local files, Color.js allows you to also import specific modules by directly importing from `src`:
- `https://colorjs.io/src/` for the CDN
- `node_modules/colorjs.io/src/ for NPM

For example:
```js
import Color from "https://colorjs.io/src/color.js";
import p3 from "https://colorjs.io/src/spaces/p3.js";
import rec2020 from "https://colorjs.io/src/spaces/rec2020.js";
import deltaE200 from "https://colorjs.io/src/deltaE/deltaE2000.js";
```

Warning: To use `import` statements in a browser, your `<script>` needs `type="module"`

Are you old school and prefer to simply have a global `Color` variable? 
We’ve got you covered! 
Just include the following script in your HTML:

```html
<script src="https://colorjs.io/dist/color.global.js"></script>
```

<p class="read-more"><a href="https://colorjs.io/get">Read more about installation</a></p>

</section>

<section>

## Reading colors

Any color from CSS Color Level 4 should work:

```js
let color = new Color("slategray");
let color2 = new Color("hwb(60 30% 40% / .5)");
let color3 = new Color("color(display-p3 0 1 0 / .9)");
let color4 = new Color("lch(50% 80 30)");
```

You can also create `Color` objects manually:

```js
let color2 = new Color("hwb", [60, 30, 40], .5);
let color3 = new Color({space: "p3", coords: [0, 1, 0], alpha: .9});
```

<p class="read-more"><a href="https://colorjs.io/docs/the-color-object.html">Read more about color objects</a>

</section>

<section>
<h2>Manipulating colors</h2>

You can use properties to modify coordinates
of any color space and convert back

```js
let color = new Color("slategray");
color.lch.l = 80; // Set coord directly in any color space
color.lch.c *= 1.2; // saturate by increasing LCH chroma by 20%
color.hwb.w += 10; // any other color space also available
```

To modify coordinates in any color space you use `color.set()` and `color.setAll()`:

```js
let color = new Color("slategray");

// Multiple coordinates
color.set({
	"lch.l": 80, // set lightness to 80
	"lch.c": c => c * 1.2 // Relative manipulation
});

// Set single coordinate
color.set("hwb.w", w => w + 10);
```

Coordinates of the color's color space are available without a prefix:

```js
let color = new Color("slategray").to("lch");

// Multiple coordinates
color.set({
	l: 80, // set lightness to 80
	c: c => c * 1.2 // Relative manipulation
});

// Set single coordinate
color.set("h", 30);
```

Chaining-style modifications are also supported:
```js
let color = new Color("lch(50% 50 10)");
color = color.set({
	h: h => h + 180,
	c: 60
}).lighten();
```

You can also use properties:

```js
let color = new Color("slategray");
color.lch.l = 80; // Set coord directly in any color space
color.lch.c *= 1.2; // saturate by increasing LCH chroma by 20%
color.hwb.w += 10; // any other color space also available
```

Coordinates of the color's color space are available without a prefix:

```js
let color = new Color("slategray").to("lch");
color.l = 80; // Set LCH lightness
color.c *= 1.2; // saturate by increasing LCH chroma
```

<p class="read-more"><a href="https://colorjs.io/docs/manipulation.html">Read more about color manipulation</a></p>

</section>

<section>

## Converting between color spaces & stringifying

Convert to any color space:

```js
let color = new Color("slategray");
color.to("lch") // Convert to LCH
```

Output in any color space

```js
let color = new Color("slategray");
color + ""; // default stringification
color.to("p3").toString({precision: 3});
```

Clip to gamut or don't
```js
let color = new Color("p3", [0, 1, 0]);
color.to("srgb") + ""; // Default toString()
color.to("srgb").toString({inGamut: false});
```

<p class="read-more"><a href="https://colorjs.io/docs/output.html">Read more about output</a></p>

</section>

<section>

## Interpolation

Get a function that accepts a percentage:

```js
let color = new Color("p3", [0, 1, 0]);
let redgreen = color.range("red", {
	space: "lch", // interpolation space
	outputSpace: "srgb"
});
redgreen(.5); // midpoint
```

Interpolation by discrete steps:

```js
let color = new Color("p3", [0, 1, 0]);
color.steps("red", {
	space: "lch",
	outputSpace: "srgb",
	maxDeltaE: 3, // max deltaE between consecutive steps
	steps: 10 // min number of steps
});
```

Shortcut for specific points in the range:

```js
let color = new Color("p3", [0, 1, 0]);
let redgreen = color.mix("red", .5, {space: "lch", outputSpace: "srgb"});
let reddishGreen = color.mix("red", .25, {space: "lch", outputSpace: "srgb"});
```

Static syntax  (every color method has a static one too):

```js
Color.mix("color(display-p3 0 1 0)", "red", .5);
```

<p class="read-more"><a href="https://colorjs.io/docs/interpolation.html">Read more about interpolation</a></p>

</section>
