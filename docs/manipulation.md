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
