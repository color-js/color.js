import Color from "colorjs.io/src/color";
import serialize from "colorjs.io/src/serialize";

// @ts-expect-error
serialize();

serialize("red"); // $ExpectType string
serialize(new Color("red")); // $ExpectType string
serialize("red", {}); // $ExpectType string
serialize("red", { precision: 5, format: "default", inGamut: false }); // $ExpectType string
serialize("red", { precision: 5, format: "default", inGamut: false, foo: "bar" }); // $ExpectType string
serialize("red", { format: { name: "CustomFormat", id: "custom-format" } }); // $ExpectType string
serialize("red", { format: "hex", collapse: false }); // $ExpectType string
