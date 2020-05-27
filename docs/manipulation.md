# Color manipulation

## By color coordinates

We've seen in the [previous section](the-color-object) how we can manipulate a color
by directly manipulating coordinates in any of the color spaces supported.
LCH coordinates are particularly useful for this so they are available directly on color objects:

```js
let color = new Color("rebeccapurple");
let color = new Color("rebeccapurple");
color.lightness *= 1.2;
color.chroma = 40;
color.hue += 30;
```

You can also use `color.set()` to set multiple coordinates at once.
In addition, it returns the color itself, so further methods can be called on it:

```js
let color = new Color("lch(50% 50 10)");
color = color.set({
	hue: h => h + 180, // relative modification!
	chroma: 60,
	"hwb.whiteness": w => w * 1.2
}).lighten();
```

## Gamuts and gamut mapping

[Color Gamut](https://en.wikipedia.org/wiki/Gamut) is the range of colors a given color space can produce.
Some color spaces (e.g. Lab, LCH, Ja<sub>z</sub>b<sub>z</sub>, CAM16) are mathematical models that encompass all visible color.
Others however cannot produce all visible color without *values out of range*.
For example. all the RGB spaces (sRGB, P3, Adobe® RGB, ProPhoto, REC.2020) have a gamut that is smaller than all visible color.
Therefore, there are colors that are perfectly normal, but cannot be represented by certain color spaces.
For example, the P3 lime (`color(display-p3 0 1 0)`) is outside of the gamut of sRGB.
In addition, colors that are **not visible to humans** can sometimes be represented by some color spaces!
Most notably, ProPhoto's primaries (pure red, pure green, pure blue) are **outside the gamut of human vision**.

The process of transforming a color outside of a given gamut to a color that is as close as possible but is *inside gamut* is called *gamut mapping*.

So how does Color.js handle all this?

Color.js does not do clipping by default, as this is lossy: If you convert from a larger color space to a smaller one and then back, you need to be able to get your original color (possibly with some roundoff error due to the calculations).

You can call `color.inGamut()` to check if the current color is in gamut of its own color space, or you can pass a different color space to check against:

```js
let lime = new Color("p3", [0, 1, 0]);
lime.inGamut();
lime.inGamut({space: "srgb"});
let sRGB_lime = lime.to("srgb");
sRGB_lime.inGamut();
```
