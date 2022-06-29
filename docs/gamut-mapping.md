# Gamut mapping

## What is color gamut?

[Color Gamut](https://en.wikipedia.org/wiki/Gamut) is the range of colors a given color space can produce.
Some color spaces (e.g. Lab, LCH, Ja<sub>z</sub>b<sub>z</sub>, CAM16) are mathematical models that encompass all visible color
and thus, do not have a fixed gamut.
Others however cannot produce all visible color without *values out of range*.
For example. all the RGB spaces (sRGB, P3, Adobe® RGB, ProPhoto, REC.2020) have a gamut that is smaller than all visible color.
Therefore, there are visible colors that cannot be represented by certain color spaces.
For example, the P3 lime (`color(display-p3 0 1 0)`) is outside of the gamut of sRGB.
In addition, colors that are **not visible to humans** can sometimes be represented by some color spaces!
Most notably, two of ProPhoto's three primaries (pure green, pure blue) are **outside the gamut of human vision**!

The process of transforming a color outside of a given gamut to a color that is as close as possible but is *inside gamut* is called *gamut mapping* and is the subject of [entire books](https://www.google.com/books/edition/Color_Gamut_Mapping/Yy0uK3pvfRMC?hl=en&gbpv=1&printsec=frontcover).

## So how does Color.js handle all this?

**Color.js does not do gamut mapping by default**, as this is lossy: If you convert from a larger color space to a smaller one and then back, you need to be able to get your original color (possibly with some roundoff error due to the calculations).

You can call `color.inGamut()` to check if the current color is in gamut of its own color space, or you can pass a different color space to check against:

```js
let lime = new Color("p3", [0, 1, 0]);
lime.inGamut();
lime.inGamut("srgb");
let sRGB_lime = lime.to("srgb");
sRGB_lime.inGamut();
```

Note that while the coordinates remain unchanged, the string representation of a Color object is, by default, _after_ gamut mapping, unless you explicitly turn that off:

```js
let lime = new Color("p3", [0, 1, 0]).to("srgb");
lime.coords;
lime.toString();
lime.toString({inGamut: false});
```


If you want gamut mapped coordinates, you can use `color.toGamut()`, which mutates the coordinates of the color it is called on.
If you want the gamut mapped color to be a different object, you can clone your color first.
You can also pass a different color space whose gamut you are mapping to via the `space` parameter.

```js
let lime = new Color("p3", [0, 1, 0]);
let sRGB_lime = lime.to("srgb");
lime.toGamut({space: "srgb"});
sRGB_lime.clone().toGamut();
sRGB_lime; // still out of gamut
```

Perhaps most important is the `method` parameter, which controls the algorithm used for gamut mapping.
You can pass `"clip"` to use simple clipping (not recommended), or any coordinate of any imported color space, which will make Color.js reduce that coordinate until the color is in gamut.

The default method is `"lch.c"` which means LCH hue and lightness remain constant while chroma is reduced until the color fits in gamut.
Simply reducing chroma tends to produce good results for most colors, but most notably fails on yellows:

![chroma-reduction](images/p3-yellow-lab.svg)

Here is P3 yellow, with LCH Chroma reduced to the neutral axis. The RGB values are linear-light P3. The color wedge shows sRGB values, if in gamut; salmon, if outside sRGB and red if outside P3. Notice the red curve goes up (so, out of gamut) before finally dropping again. The chroma of P3 yellow is 123, while the chroma of the gamut-mapped result is far to low, only 25!

Instead, the default algorithm reduces chroma (by binary search) and also, at each stage, calculates the deltaE2000 between the current estimate and a channel-clipped version of that color. If the deltaE is less than 2, the clipped color is displayed. Notice the red curve hugs the top edge now because clipping to sRGB also means it is inside P3 gamut. Notice how we get an in-gamut color much earlier. This method produces an in-gamut color with chroma 103.

![chroma-reduction-clip](images/p3-yellow-lab-clip.svg)
