---
title: Performance optimizations
---
# Performance optimizations

Color.js should have good performance for most tasks, however it does support multiple ways of doing the same thing
and not all of these ways have the same performance.

In most cases you wouldn't notice a difference and you should just pick the syntax that feels more natural to you.
However, if you are doing millions of operations (e.g. a nested loop to draw a gradient with color computations for every pixel)
then you might benefit from picking the fastest syntax for each operation.

This page includes some tips for using Color.js on such performance-sensitive tasks.

- For creating colors, the fastest way is `new Color(colorSpace, coords [, alpha])` which doesn't need to do any string parsing.
For added performance, use a `ColorSpace` object instead of a color space id.
- Do not use accessors (the `color.spaceId.coordId` syntax). Use `color.get(coordRef)` and `color.set(coordRef, value)` instead.
- For any method that accepts a coord reference (such as `color.get()` and `color.set()`),
provide it as an array or object (e.g. `[Color.spaces.lch, 'l']` or `{space: Color.spaces.lch, coordId: 'l'`) rather than a string that needs to be parsed (e.g. `"lch.l"`)