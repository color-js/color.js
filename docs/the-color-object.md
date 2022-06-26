# The Color Object

The first part to many Color.js operations is creating a Color object,
which represents a specific color,
in a particular colorspace,
and has methods to convert the color to other spaces
or to manipulate it..
There are many ways to do so.

## Passing a CSS color string

```js
let color = new Color("slategray");
let color2 = new Color("hwb(60 30% 40% / .1)");
let color3 = new Color("color(display-p3 0 1 0)");
let color4 = new Color("lch(50% 80 30)");
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

The exact ranges for these coordinates are up to the
[color space](spaces.html) definition.

You can also pass another color, or an object literal with `spaceId`/`space`, `coords`, and optionally `alpha` properties:

```js
let red1 = new Color({space: "lab", coords: [50, 50, 50]});
let red2 = new Color({spaceId: "lab", coords: [50, 50, 50]});
let redClone = new Color(red1);
```

Everything in Color.js that accepts a color space id, also accepts a color space object.
You can find these objects on `Color.spaces` (object, includes aliases) or `Color.Space.all` (array, no aliases).
They include a lot of metadata about the color space which can be useful to handle color generically
(e.g. like [this demo](../apps/convert/))

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
color.srgb.g;
color.srgb.g = .5;
color;
```

Note that a color's color space is immutable once the `Color` object is created.
Manipulating coordinates of other color spaces does not change a color's space, the coordinates are converted to the other color space and then back to the color's color space after the manipulation.
To convert a color to a different color space, you need to call `color.to()`, which will return a new `Color` object.

```js
let color = new Color("srgb", [0, 1, 0]);
let colorP3 = color.to("p3");
color;
colorP3;
```

Sometimes, when converting to a color space with a smaller gamut, the resulting coordinates may be out of gamut.
You can test for that with `color.inGamut()` and get gamut mapped coordinates with `color.toGamut()`:


```js
let funkyLime = new Color("p3", [0, 1, 0]);
let boringLime = funkyLime.to("srgb");
boringLime.coords;
boringLime.inGamut();
boringLime.toGamut();
```

Note that `color.toString()` returns gamut mapped coordinates by default.
You can turn this off, via the `{inGamut: false}` option.
You can read more about gamut mapping in the [Gamut mapping](manipulation.html#gamut-mapping) section.
