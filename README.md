# Brainstorming

## Use cases we need to cover

- Color conversion between color spaces
- Color adjustment (lighter/darker etc)
- Palette creation
- Contrast
- DeltaE
- Interpolation (in any color space, including linear RGB)


## Color spaces in Chris' code

- RGB spaces: sRGB, P3, s98rgb, prophoto, rec2020
- Absolute spaces: Lab, LCH, XYZ, xyY, Luv

## Warts

- Gamma. Is linear light merely a gamma of 1? Should we just have a gamma property?
- White point
- Transformations: Lab to LCH, RGB to HSL
- Does HSL only apply to sRGB or all RGBs? Is there a different HSL transformation per RGB space?
- Hex colors. People want these, terrible as they might be :/
- Rendering intent

## Decisions

### Color space as subclass or property?

- As subclass: We'd have classes like sRGBColor, P3Color etc that inherit from Color.
- As property: Each Color instance would have a colorSpace property that would point to a colorSpace object.
Anyone can add colorSpace objects. The constructor consists (as a minimum) of an id (e.g. "a98rgb") and a toXYZ and fromXYZ function
- Possibly a combination: An RGBColor class for all RGB Color spaces and an RGBColorSpace class for all RGB color spaces, with stuff like linear light / gamma, hex, HSL, gamut mapping. Downside: they can't use the constructor, they'd need to do `Color.create()` (unless we want them to use the explicit constructor, or do an expensive prototype change)

**Decision**: For now, we went with a single `Color` class, and with a colorSpace property that points to a colorSpace object (just an object literal with colorspace config). One registers new color spaces by calling `Color.space(colorSpaceConfig)`.
