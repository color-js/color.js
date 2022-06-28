---
title: Procedural, tree-shakable API
body_classes: cn-ignore language-javascript
---

# Procedural, tree-shakable API

In addition to the object oriented API that most examples here use, Color.js also supports a procedural API
that operates on plain objects instead of `Color` objects.

There are several reasons to use this API:

- It is approximately two times faster, making it more suitable for performance-sensitive tasks.
- It is tree-shakeable (except color spaces at the moment), which results to a smaller bundle size when using build tools.
- Plain functions operating on plain objects are easier to debug
- Personal preference: some people find procedural APIs easier to understand.

To use it, you import functions from modules directly, either one by one or en masse.

Note: These examples assume using [Color.js via npm](https://npmjs.com/package/colorjs.io)
but everything applies to importing from URLs too.

```js
// Import multiple functions at once
import {
	to as convert,
	toGamut,
	serialize
} from "colorjs.io/fn";

// You can also import functions directly:
import parse from "./node_modules/colorjs.io/src/parse.js";

// Parsing color
let red = parse("red");

// Directly creating object literal
let p3_lime = {space: "p3", coords: [0, 1, 0]};

let p3_lime_srgb = convert(p3_green, "srgb");
toGamut(p3_lime_srgb);
serialize(p3_lime_srgb);
```

## More tips for performance-sensitive tasks

In addition to using the procedural API for performance-sensitive tasks,
here are a few more tips to make your code faster for those cases where every millisecond counts:

- For any function that accepts a coord reference (such as `get(color, coord)` and `set(color, coord, value)`),
provide it as an array or object (e.g. `[ColorSpace.get("lch"), "l"]` or `{space: ColorSpace.get("lch"), coordId: 'l'`)
rather than a string that needs to be parsed (e.g. `"lch.l"`)