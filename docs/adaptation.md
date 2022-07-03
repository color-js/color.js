# Chromatic adaptation

## Measuring, and predicting, colors

Ideally, the color of something
(a colored patch on screen, or a physical object)
is determined with a __spectrophotometer__.
The amount of light at every wavelength
(in practice, a group of wavelengths
at 5nm, 10nm, or even 20nm spacing)
is measured.

For colors on screen, the white is also measured.
For physical colors, the light which is illuminating the object
(the amount of illuminant light at each wavelength)
must also be measured.

The spectrophotometer can then calculate the XYZ and Lab or LCH values.

Objects measure very differently under different lights.
They also look different, but much less so
(this is called _color constancy_).
The process whereby our eyes change from seeing one color as white,
to seeing another color as white,
and finding that most objects look similar to what they did before,
is called __chromatic adaptation__.

As long as we retain the original measured spectral data,
we can calculate _what the object would have looked like_
under any other illuminant.

Often though we don't have the spectral data;
either it wasn't saved,
or the color was measured by a __colorimeter__
which just passes the light through three filters
and directly reads out in XYZ.

If you have a color measured under one illuminant,
the __corresponding color__ is another color which
_looks the same_ under a second illuminant.

A chromatic adaptation transform is a way of _predicting_
the corresponding color.

## Illuminants

To save the trouble of measuring illuminant spectra all the time,
_standard illuminants_ exist.

For example, Illuminant A is the orangeish light
produced by a tungsten electric lightbulb
(specifically, one with a filament temperature of 2,856K).

Illuminant C, an early attempt to simulate natural daylight,
is Illuminant A with a specific blue filter.
(it is rarely used nowadays,
but there is a lot of experimental data measured with it
so it is useful to adapt _from_).

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
so we don't implement it. You could try to do it yourself if you wanted:

```js
let W1 = Color.WHITES.D65;
let W2 = Color.WHITES.D50;
let Xscale = W1[0]/W2[0];
let Zscale = W1[2]/W2[2];
let color = new Color("rebeccapurple");
let color2 = color.xyz /// aah nevermind this isn't going to work
```

but it would not be worth the trouble.
Don't do this.

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
let W1 = Color.WHITES.D65;
let W2 = Color.WHITES.D50;
let color = new Color("rebeccapurple");
// now get the xyz-d65 coordinates
// and matrix multiply by a cone response matrix
// scale by the whites
// and convert back to XYZ with a new white point.
```

### Bradford

Invented by Lam at the University of Bradford,
this method uses modified (sharpened) cone responses
with less overlap between the three cone types.
While this doesn't represent the actual physiological responses,
it does give better predictive accuracy.
The originally published CAT also incorporated
a correction for the non-linear response of the
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

```js
let color = new Color("rebeccapurple");
let color2 = color.to("lch");
// Bradford CAT happened for you without any fuss
```

### CAT97s

At the close of the 20th century,
the International Lighting Commission (CIE)
came up with a _color appearance model_
which used a modified form of the original, non-linear Bradford CAT.
It has since been superseded by later models
which are more accurate,
easier to calculate,
and more numerically stable.
We therefore haven't implemented CAT97s.

### CAT02

Based on early experience with CAT97s
and the result of a lot of numerical optimization
to give the best predictive accuracy
on a large dataset of corresponding colors,
CAT02 has entirely replaced CAT97s.
Like the Bradford method,
an optimized, sharpened set of cone responses is used.

CAT02 also allows for _partial adaptation_ to the new whitepoint.
When the illumination changes, Fairchild &amp; Reniff measured that
our eyes become 60% adapted in a couple of seconds
and are 95% adapted after 90 seconds.
Because it is difficult to measure the state of adaptation,
we implemented the simplified, fully adapted CAT02 transform.

CAT02 fails to predict corresponding colors when the illuminant
is very far from daylight
such as vividly colored stage lighting.

### CAT16

Li et al showed that CAT16 gives somewhat better predictions than CAT02,
particularly with vivid non-white illuminants,
while also being more numerically robust and mathematically simpler.
// A Revision of CIECAM02 and its CAT and UCS
// Changjun Li, Zhiqiang Li, et al (2016)
// 24th Color and Imaging Conference Final Program and Proceedings

CAT16, as originally published, has been criticized by Smet & Ma
for incorrectly scaling by a reference white luminance,
which is usually but not always 1.0.
Our implementation omits this scaling,
which is becoming recommended practice.

CAT16 defines both a one-stage and a two-stage CAT;
in the latter, colors are first adapted to an equal-energy white
and then to the destination white in a second step.
We have only implemented the one-stage CAT,
which gived identical results for full adaptation.

## Using CATs

By default, only linear Bradford is available
and only two whitepoints are supported:
D65, as used by most RGB colorspaces,
and D50, as used by Lab, LCH, XYZ
and also ProPhoto RGB and most CMYK colorspaces.
Attempting to use another whitepoint or a different method will give an error.

```js
let color1 = new Color("p3", [0.22, 0.63, 0.42]); // D65 white
let color2 = new Color("prophoto", [0.15, 0.54, 0.21]); //D50 white
color1.lch;
// linear Bradford was used to adapt to D50 before conversion to Lab
color2.lch;
// no CAT was needed, whitepoints the same
```

The optional CATs.js module
uses an extension hook to add
a number of other standard illuminants,
and several other CAT methods.
Because these are all one-stage linear transformations,
the choice of source whitepoint, destination whitepoint,
and CAT method produces a single matrix transform,
which our code will automatically use
whenever the source and destination colorspaces have different whitepoints.
