# Chromatic adaptation

## What does it do?

Ideally, the color of something
(a colored patch on screen, or a physical object)
is determined with a **spectrophotometer**.
The amount of light at every wavelength
(in practice, a group of wavelengths
at 5nm, 10nm, or even 20nm spacing)
is measured.

For colors on screen, the white is also measured.
For physical colors, the light which is illuminating the object
(the amount of illuminant light at each wavelength)
must also be measured. Objects looks different under different lights.

The spectrophotometer can then calculate the XYZ and Lab or LCH values.

As long as we retain the original spectral data,
we can then calculate _what the object would have looked like_
under any other illuminant.

Often though we don't have the spectral data;
either it wasn't saved,
or the color was measured by a **colorimeter**
which just passes the light through three filters
and directly reads out in XYZ.

If you have a color measured under one illuminant,
the **corresponding color** is another color which
_looks the same_ under a second illuminant.

Chromatic adaptation is a way of _predicting_
the corresponding color.

## Illuminants

To save the trouble of measuring illuminant spectra all the time,
_standard illuminants_ exist.
For example, Illuminant A is the orangeish light
produced by a tungsten electric lightbulb
(specifically, one with a filament temperature of 2,856K).
Illuminant C, an early attempt to simulate natural daylight,
is Illuminant A with a specific blue filter.
(it is rarely used nowadays, but there is a lot of experimental data measured with it).
Illuminant D65 represents the light in the shade (no direct sunlight) at noon,
and has a color temperature of 6500K.
Illuminant D50 is similar but represents direct sunlight at noon.
Illuminant F2 is a particular type of fluorescent lamp, and so on.

However, you can measure the specific type of light
in a given situation and use those measured XYZ values,
if you want. To allow comparison, the XYZ values are normalized,
so that the Y value (luminance) is exactly 1.


## Types of Chromatic Adaptation Transform

There are different chromatic adaptation transforms (CATs),
which vary in complexity and accuracy.

### XYZ scaling

If the first illuminant is, say, D50 (XYZ 0.96422, 1.00000, 0.82521)
and the second one is D65 (XYZ 0.95047, 1.00000, 1.08883),
the XYZ scaling method says hey,
to go from one white to the other,
we just scale X by 0.96422/0.95047
and scale Z by 0.82521/1.08883.
Simple, let's do exactly that to all the other colors.

This doesn't predict corresponding colors _at all well_
so we don't implement it. But you can do it yourself if you want:

```js
let W1 = Color.whites.D65;
let W2 = Color.whites.D50;
let Xscale = W2.x/W1.x;
let Zscale = W2.z/W1.z;
let color = new Color("rebeccapurple");
let color2 = color.xyz /// aah nevermind this isn't going to work
```

### von Kries

Named after an early 20th century color scientist,
this method converts the first illuminant
from XYZ to _cone responses_
(the relative stimulation of the three types of cones in the human retina).
Same for the second illuminant,
and a cone scaling is calculated to go from one white to another.
This scaling is used to change all the other colors:
convert XYZ to cones, scale, convert back to XYZ.

von Kries works much better than XYZ scaling,
as long as the two illuminants are fairly similar to daylight,
and the colors to be adapted are not very saturated.

```js
let W1 = Color.whites.D65;
let W2 = Color.whites.D50;
let color = new Color("rebeccapurple");
// okay this isn't going to work either
```

### Bradford

Invented by Lam at the University of Bradford,
this method uses modified (sharpened) cone responses
with less overlap between the three cone types.
While this doesn't represent the actual physilogical responses,
it does give better predictive accuracy.
The originally published CAT also incorporated
a correction for the non-linear resonse of the
short wavelength ("blue") cone.
Later studies found that this correction
did not significantly improve accuracy,
and prevented round-tripping,
so it was dropped.
The simplified (linear) bradford transform is what we implemented.

The International Color Consortium,
when they were tightening up the specification of ICC color profiles,
specified that the linear Bradford CAT must be used by all ICC software.

Linear Bradford is thus our default CAT.
If you specify a color in, say sRGB or display-P3
(both of which use a D65 whitepoint),
and then convert it to LCH (which uses a D50 whitepoint),
the XYZ values are automatically passed through a linear Bradford CAT
before being converted to Lab and then LCH.
Normally, this is exactly what you want,
and gives compatibility between our code
and results obtained via ICC profiles.

### CAT97s

At the close of the 20th century,
the International Lighting Commission (CIE)
came up with a _color appearance model_
which used a modified form of the original, non-linear Bradford CAT.
It has since been superceeded by later models
which are more accurate,
easier to calculate,
and more numerically stable.
We haven't implemented CAT97s.

### CAT02

Based on early experience with CAT97s
and the result of a lot of numerical optimization
to give the best predictive accuracy
on a large dataset of corresponding colors,
CAT02 has entirely replaced CAT97s.
Like the Braqdford method,
and optimized, sharpened set of cone resonses is used.

CAT02 also allows for _partial adaptation_ to the new whitepoint.
When the illumination changes, our eyes become 60% adapted in a couple of seconds
and are 95% adapted after 90 seconds.
Because it is difficult to measure the state of adaptation,
we implemented the simplified, fully adapted CAT02 transform.

CAT02 fails to predict corresponding colors when the illuminant
is very far from daylight
such as vividly colored stage lighting.

### CAT16

TODO how is this better than CAT02.

CAT16 gives somewhat better predictions that CAT02,
particularly with vivid non-white illuminants.

CAT16 has been criticized by Smet &amp Ma
for incorrectly scaling by a reference white luminance,
which is usually but not always 1.0.
Our implementation omits this scaling.

CAT16 defines both a one-stage and a two-stage CAT;
in the latter, colors are first adapted to an equal-energy white
and then to the destination white in a second step.
We have only implemented the one-stage CAT.

