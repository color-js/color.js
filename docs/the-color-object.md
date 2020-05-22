# The Color Object

The first part to many Color.js operations is creating a Color object.
There are many ways to do so.

## Passing a CSS color string

```js
let color = new Color("slategray");
let color2 = new Color("hwb(60 30% 40% / .1)");
let color3 = new Color("color(display-p3 0 1 0)");
let color4 = new Color("lch(50% 80 30)");
```

You can even use CSS variables, optionally with a DOM element against which they will be resolved (defaults to document root):

```js
new Color("--color-blue");
new Color("--color-green", document.querySelector("h1"));
```

## Color space and coordinates

Internally, every Color object is stored this way, so this is the most low level way to create a Color object.

```js
let lime = new Color("sRGB", [0, 1, 0], .5); // optional alpha
let yellow = new Color("P3", [1, 1, 0]);
new Color("lch", [50, 30, 180]);

// Capitalization doesn't matter
new Color("LCH", [50, 30, 180]);

// Color space objects work too
new Color(Color.spaces.lch, [50, 30, 180]);
```

The exact ranges for these coordinates are up to the color space definition.

You can also pass another color, or an object literal with `spaceId`/`space`, `coords`, and optionally `alpha` properties:

```js
let red = new Color({space: "lab", coords: [50, 50, 50]});
let red = new Color({spaceId: "lab", coords: [50, 50, 50]});
let redClone = new Color(red);
```

## Color object properties

The three basic properties of a color object are its color space, its coordinates, and its alpha:

```js
let color = new Color("deeppink");
color.space; // Color space object
color.space === Color.spaces.srgb;
color.spaceId; // same as color.space.id
color.coords;
color.alpha;
```

However, you can also use color space ids to get the color's coordinates in any other color space:


```js
let color = new Color("deeppink");
color.srgb;
color.p3;
color.lch;
color.lab;
color.prophoto;
```

In fact, you can even manipulate the color this way!


```js
let color = new Color("deeppink");
color.lch[0] = 90;
color;
```

Named coordinates are also available:

```js
let color = new Color("deeppink");
color.srgb.green;
color.srgb.green = .5;
color;
```

Note that unless we explicitly change a color's color space, it remains in the same color space it was when it was created.
Manipulating coordinates of other color spaces do not change a color's space, it is just internally converted to another space and then back to its own.
To convert a color to a different color space, you need to change its `space` or `spaceId` properties.
Both accept either a color space object, or an id:


```js
let color = new Color("srgb", [0, 1, 0]);
color.space = "p3";
color;
color.space = Color.spaces.prophoto;
color;
```

Often, we want to keep our color intact, but also convert it to another color space.
This is exactly what `color.to()` is for:

```js
let color = new Color("srgb", [0, 1, 0]);
let colorP3 = color.to("p3");
color;
colorP3;
```
