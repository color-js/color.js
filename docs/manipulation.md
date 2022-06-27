# Color manipulation

## By color coordinates

We've seen in a [previous section](the-color-object) how we can manipulate a color
by directly manipulating coordinates in any of the color spaces supported.

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