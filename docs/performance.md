# Using Color.js for performance sensitive tasks

Color.js should have good performance for most tasks, however it does support multiple ways of doing the same thing
and not all of these ways have the same performance.
This page includes some tips for which parts of the API to prefer when working on performance-sensitive code,
such as code that performs millions of repetitive operations in a short amount of time
(e.g. to draw a gradient pixel by pixel).

- For creating colors, the fastest way is `new Color(colorSpace, coords [, alpha])` which doesn't need to do any string parsing
- Do not use accessors (the `color.spaceId.coordId` syntax). Use `color.get(coordRef)` and `color.set(coordRef, value)` instead.
- For any method that accepts a coord reference (such as `color.get()` and `color.set()`), provide it as an array or object (e.g. `[Color.spaces.lch, 'l']`) rather than a string that needs to be parsed (e.g. `"lch.l"`)