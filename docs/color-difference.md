# Color differences

## Euclidean distance

We often need to determine the distance between two colors, for a variety of use cases.
Before most people dive into color science, when they are only familiar with sRGB colors,
their first attempt to do so usually is the Euclidean distance of colors in sRGB,
like so: `sqrt((r₁ - r₂)² + (g₁ - g₂)² + (b₁ - b₂)²)`.
However, since sRGB is not [perceptually uniform](https://programmingdesignsystems.com/color/perceptually-uniform-color-spaces/),
pairs of colors with the same Euclidean distance can have hugely different perceptual differences:

<div style="background: hsl(30, 100%, 50%)"></div>
<div style="background: hsl(50, 100%, 50%)"></div>
<div style="background: hsl(230, 100%, 50%)"></div>
<div style="background: hsl(250, 100%, 50%)"></div>

```js
let color1 = new Color("hsl(30, 100%, 50%)");
let color2 = new Color("hsl(50, 100%, 50%)");
let color3 = new Color("hsl(230, 100%, 50%)");
let color4 = new Color("hsl(260, 100%, 50%)");
color1.distance(color2, "srgb");
color3.distance(color4, "srgb");
```

Notice that even though `color3` and `color4` are far closer than `color1` and `color2`, their sRGB Euclidean distance is slightly larger!

Euclidean distance *can* be very useful in calculating color difference, as long as the measurement is done in a perceptually uniform color space, such as Lab, ICtCp or Jzazbz:

```js
let color1 = new Color("hsl(30, 100%, 50%)");
let color2 = new Color("hsl(50, 100%, 50%)");
let color3 = new Color("hsl(230, 100%, 50%)");
let color4 = new Color("hsl(260, 100%, 50%)");
color1.distance(color2, "lab");
color3.distance(color4, "lab");

color1.distance(color2, "jzazbz");
color3.distance(color4, "jzazbz");
```

## Delta E (ΔE)

DeltaE (ΔE) is a family of algorithms specifically for calculating the difference (delta) between two colors.
The very first version of DeltaE, [DeltaE 1976](https://en.wikipedia.org/wiki/Color_difference#CIE76) was simply the Euclidean distance of the colors in Lab:

```js
let color1 = new Color("hsl(30, 100%, 50%)");
let color2 = new Color("hsl(50, 100%, 50%)");
let color3 = new Color("hsl(230, 100%, 50%)");
let color4 = new Color("hsl(260, 100%, 50%)");

color1.deltaE76(color2);
color3.deltaE76(color4);
```

However, because Lab turned out to not be as perceptually uniform as it was once thought, the algorithm was revised in 1984 (CMC), 1994, and lastly, 2000, with the most accurate and most complicated Lab-based DeltaE algorithm to date.

Instead of handling the remaining perceptual non-uniformities of Lab in the color difference equation,
another option is to use a better color model and perform a simpler color difference calculation in that space.

Examples include DeltaEJz (which uses JzCzhz) and deltaEITP (which uses ICtCp). An additional benefit of these two color difference formulae is that, unlike Lab which is mostly tested with medium to low chroma, reflective surface colors, JzCzhz and ICtCp are designed to be used with light-emitting devices (screens), high chroma colors often found in Wide Gamut content, and a much larger range of luminances as found in High Dynamic Range content.

Color.js supports all the DeltaE algorithms mentioned above except DeltaE 94. Each DeltaE algorithm comes with its own method (e.g. `color1.deltaECMC(color2)`),
as well as a parameterized syntax (e.g. `color1.deltaE(color2, "CMC")`).

```js
let color1 = new Color("blue");
let color2 = new Color("lab", [30, 30, 30]);
let color3 = new Color("lch", [40, 50, 60]);

color1.deltaE(color2, "76");
Color.deltaE(color2, color3, "76");

color1.deltaE(color2, "CMC");
Color.deltaE(color2, color3, "CMC");

color1.deltaE(color2, "2000");
Color.deltaE(color2, color3, "2000");

color1.deltaE(color2, "ITP");
Color.deltaE(color2, color3, "ITP");
```

For most DeltaE algorithms, 2.3 is considered the "Just Noticeable Difference" (JND).
Can you notice a difference in the two colors below?

```js
let color1 = new Color("lch", [40, 50, 60]);
let color2 = new Color("lch", [40, 50, 60]);

color1.deltaE(color2, "76");
color1.deltaE(color2, "CMC");
color1.deltaE(color2, "2000");
```

## Setting the default DeltaE algorithm

Notice that even if you include better DeltaE algorithms such as ΔΕ2000,
the default DeltaE algorithm used in every function that accepts a deltaE argument (e.g `Color#steps()`) or `color.deltaE()` with no method parameter will remain DeltaE 1976.
This is because Color.js doesn't necessarily know which DeltaE method is better for your use case.
E.g. for high performance code, you may prefer the speed over accuracy tradeoff of DeltaE 1976.
You can however change this default:

```js
let color1 = new Color("blue");
let color2 = new Color("lch", [20, 50, 230]);
color1.deltaE(color2);
Color.defaults.deltaE = "2000";
color1.deltaE(color2);
```
