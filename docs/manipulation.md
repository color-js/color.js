# Color manipulation

## By color coordinates

We've seen in the [previous section](the-color-object) how we can manipulate a color
by directly manipulating coordinates in any of the color spaces supported.
LCH coordinates are particularly useful for this so they are available directly on color objects:

```js
let color = new Color("rebeccapurple");
color.l *= 1.2;
color.c = 40;
color.h += 30;
```

You can also use `color.set()` to set multiple coordinates at once.
In addition, it returns the color itself, so further methods can be called on it:

```js
let color = new Color("lch(50% 50 10)");
color = color.set({
	h: h => h + 180, // relative modification!
	c: 60,
	"hwb.w": w => w * 1.2
}).lighten();
```
