import Color from "colorjs.io/src/index";

// Make sure that the module augmentation is working
const color1 = new Color("red");
const color2 = color1.to("srgb");
const color3: Color = color2;

color1.contrast;
color2.contrast;
color3.contrast;
