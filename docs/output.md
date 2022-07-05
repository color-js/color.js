# Output

Eventually, no matter what your calculations are, you will want to display some kind of output, most likely on a web page,
frequently in CSS. This page is all about that.

## Getting a string representation of a color

`color.toString()` is a swiss army knife for many of your serialization needs.
In fact, you may have used it without knowing, since JavaScript calls it implicitly with no params when you coerce an object to a string:

```js
let magenta = new Color("srgb", [1, 0, .4]);
"I love " + magenta;
```

While this may suffice for some uses, in many cases you will want to provide parameters to customize the result.
Here are a few examples.

### Choose a specific output format

Each color space supports multiple output formats, you can use the `format` option to pick between them:

```js
let lv_magenta = new Color("#ff0066");
lv_magenta.toString({format: "rgb"});
lv_magenta.toString({format: "rgba"});
lv_magenta.toString({format: "hex"});
lv_magenta.toString({format: "color"});

// Custom functional format:
lv_magenta.toString({format: {
	name: "myrgb",
	coords: [
		"<number>[0, 255]",
		"<angle>",
		"<percentage>"
	]
}})
```

### Disable gamut mapping

```js
let funkyMagenta = new Color("p3", [1, 0, .4]);
funkyMagenta = funkyMagenta.to("srgb");
funkyMagenta.toString(); // gamut mapping by default
funkyMagenta.toString({inGamut: false}); // disable gamut mapping
```

Note that you cannot disable gamut mapping in `certain color spaces whose conversion math doesn't make sense for out of gamut values.
These are typically the polar forms of gamma-corrected sRGB (HSL, HWB, HSV etc).

### Change precision

By default, values are rounded to 5 significant digits.
You can change that with the `precision` parameter:

```js
let pink = new Color("lch", [70, 50, 350]);
pink = pink.to("srgb");
pink.toString();
pink.toString({precision: 1});
pink.toString({precision: 2});
pink.toString({precision: 3});
pink.toString({precision: 21});
```

Tip: Building an app that needs high precision? You can change the default precision of 5 globally by setting `Color.defaults.precision`!

## Get a displayable CSS color value

When using sRGB or HSL, you can just use the output of `color.toString()` directly in CSS.
However, with many color spaces, and most browsers, this is not the case yet.

One way to go about with this is to check if the value is supported and convert it if not:

```js
let green = new Color("lch", [80, 80, 120]);
let cssColor = green.toString();
if (!CSS.supports("color", cssColor))
	cssColor = green.to("srgb").toString();
```

This works fairly well, but the browser may support a wider gamut than sRGB, and it forces everything into sRGB.
An iterative approach may be better:

```js
let green = new Color("lch", [80, 80, 120]);
let cssColor = green.toString();
if (!CSS.supports("color", cssColor))
	cssColor = green.to("p3").toString();
if (!CSS.supports("color", cssColor))
	cssColor = green.to("srgb").toString();
cssColor;
```
As of June 2022, `cssColor` will be sRGB in Chrome and Firefox, and P3 in Safari, providing access to 50% more colors than sRGB!

So, this works, but the process is a little tedious. Thankfully, Color.js has got your back!
Simply use the `color.display()` method.
By default, it will use the widest of the default set of fallbacks ([Lab](spaces.html#lab), [REC.2020](spaces.html#rec2020), [P3](spaces.html#p3), then [sRGB](spaces.html#srgb)),
but you can also provide your own space when the color to be output is not supported by the current browser.
Note that in Node, the fallback space is always sRGB if not provided.
Let's rewrite the example above using `color.display()`!

```js
let green = new Color("lch", [80, 80, 120]);
let cssColor = green.display();
let cssColor2 = green.display({space: "hsl"});
```

Tip: You can change the default fallback by setting `Color.defaults.display_space`.

What if you want access to the converted color? For example, you may want to indicate whether it was in gamut or not.
You can access the `color` property on the returned value:

```js
let green = new Color("lch", [80, 90, 120]);
let cssColor = green.display();
cssColor.color.inGamut();
```

Note: While `color.toString()` returns a primitive string in most cases, when `fallback` is used it returns a `String` object
so that it can have a property (primitives in JavaScript cannot have properties).
In that case, it will return a `String` object **even if it didn't need to actually use a fallback color**

## Creating a CSS gradient from a range

When working with [ranges](interpolation), you may often need to display the range as a CSS gradient.
The trick here is to grab as many steps as you need via `color.steps()`, then use them as gradient color stops.
If you don't know how many steps you need, this is what the `maxDeltaE` parameter is for, as it lets you specify the maximum allowed deltaE between consecutive colors.

<div id="test" style="width: 100%; height: 2em"></div>

```js
let r = Color.range("hsl(330 90% 50%)", "hotpink");
let stops = Color.steps(r, {steps: 5, maxDeltaE: 3});
let element = document.querySelector("#test");
element.style.background = `linear-gradient(to right, ${
	stops.join(", ")
})`;
```

Play with the parameters above to see what gradient is produced, or use the [gradients demo app](/apps/gradients)!

Note that in the example above, `color.toString()` is called implicitly with no params due to `array.join()`.
This can produce colors that are not supported by the current browser.
You can also map the colors to strings yourself (e.g. so you can provide the `fallback` parameter):

<div id="test2" style="width: 100%; height: 2em"></div>

```js
let r = Color.range("rebeccapurple", "gold");
let stops = Color.steps(r, {steps: 10});
let element = document.querySelector("#test2");
element.style.background = `linear-gradient(to right, ${
	stops.map(c => c.display()).join(", ")
})`;
```
