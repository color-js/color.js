import Color from "../src/index.js";
import ColorSpace from "../src/ColorSpace.js";
import * as check from "../node_modules/htest.dev/src/check.js";

/**
 * Compare [...coords, alpha], where any of them may be a missing component.
 * Missing components are `null` in Color.js, and `check.proximity()` would happily match
 * `null` against 0, since `Math.abs(null - 0)` is 0. Conflating the two is precisely the bug
 * these tests guard against, so missing components are compared strictly instead.
 * NaN fails `proximity()`, which is what we want: it is never a valid result.
 * @param {{ epsilon?: number }} options
 */
function checkColor ({ epsilon = 0.0001 } = {}) {
	let closeEnough = check.proximity({ epsilon });

	return check.deep((actual, expect) => {
		if (actual === null || expect === null) {
			return actual === expect;
		}

		return closeEnough(actual, expect);
	});
}

export default {
	name: "Interpolation tests",
	description: `These tests check hue arcs, premultiplied alpha, and missing components during interpolation.
	Expected values are hand-derived from
	<a href="https://drafts.csswg.org/css-color-4/#interpolation">CSS Color 4 § 13</a>,
	or taken from the examples in the spec.
	Colors are given in the interpolation space, so that conversion cannot obscure what is being tested.`,
	run (color1, color2, p = 0.5) {
		let color = Color.range(color1, color2, this.data.options)(p);
		return [...color.coords, color.alpha];
	},
	check: checkColor(),
	tests: [
		{
			name: "Hue coordinate lookup",
			description: `Premultiplication needs to know which coordinate, if any, is a hue angle.
			Note that it is not always called "h", nor is it always last.`,
			run (id) {
				let space = ColorSpace.get(id);
				return [space.hueId, space.hueIndex, space.isPolar];
			},
			check: check.deep(),
			tests: [
				{
					args: ["oklch"],
					expect: ["h", 2, true],
				},
				{
					name: "Jzczhz names its hue coordinate hz",
					args: ["jzczhz"],
					expect: ["hz", 2, true],
				},
				{
					name: "HSL has its hue first, not last",
					args: ["hsl"],
					expect: ["h", 0, true],
				},
				{
					args: ["hwb"],
					expect: ["h", 0, true],
				},
				{
					name: "Lab is not polar",
					args: ["lab"],
					expect: [null, -1, false],
				},
				{
					name: "sRGB is not polar",
					args: ["srgb"],
					expect: [null, -1, false],
				},
			],
		},
		{
			name: "Premultiplied alpha in polar spaces",
			description: `The hue angle must not be premultiplied, only the other two coordinates.
			Interpolating an opaque color with a fully transparent one therefore keeps the opaque color's
			lightness and chroma throughout, while the hue is simply interpolated.`,
			data: { options: { space: "oklch", premultiplied: true } },
			tests: [
				{
					name: "Opaque endpoint is unchanged",
					args: ["oklch(80% 0.2 30)", "oklch(40% 0.1 90 / 0)", 0],
					expect: [0.8, 0.2, 30, 1],
				},
				{
					name: "Midpoint keeps L and C of the opaque color, and averages the hue",
					description: `Premultiplied, the transparent color contributes [0 0] to L and C,
					so the midpoint is [0.4 0.1] / 0.5 = [0.8 0.2]. The hue is not premultiplied,
					so it is (30 + 90) / 2 = 60, and not 60 / 0.5 = 120.`,
					args: ["oklch(80% 0.2 30)", "oklch(40% 0.1 90 / 0)", 0.5],
					expect: [0.8, 0.2, 60, 0.5],
				},
				{
					name: "Zero alpha does not divide by zero",
					description: `Un-premultiplying by an alpha of zero would produce NaN.
					Per CSS Color 4, the un-premultiplied value is the premultiplied value instead.`,
					args: ["oklch(80% 0.2 30)", "oklch(40% 0.1 90 / 0)", 1],
					expect: [0, 0, 90, 0],
				},
				{
					name: "Partial alphas, 0.8 and 0.2",
					description: `Premultiplied, the endpoints are [0.64 0.16 30] and [0.08 0.02 90],
					so the midpoint is [0.36 0.09 60], which un-premultiplies by 0.5 to [0.72 0.18 60].`,
					args: ["oklch(80% 0.2 30 / 0.8)", "oklch(40% 0.1 90 / 0.2)", 0.5],
					expect: [0.72, 0.18, 60, 0.5],
				},
				{
					name: "Same colors, not premultiplied, for comparison",
					data: { options: { space: "oklch" } },
					args: ["oklch(80% 0.2 30 / 0.8)", "oklch(40% 0.1 90 / 0.2)", 0.5],
					expect: [0.6, 0.15, 60, 0.5],
				},
				{
					name: "HSL, whose hue is the first coordinate",
					data: { options: { space: "hsl", premultiplied: true } },
					args: ["hsl(0 100% 50%)", "hsl(60 50% 20% / 0)", 0.5],
					expect: [30, 100, 50, 0.5],
				},
				{
					name: "Jzczhz, whose hue is called hz",
					data: { options: { space: "jzczhz", premultiplied: true } },
					args: ["color(jzczhz 0.1 0.05 30)", "color(jzczhz 0.05 0.02 90 / 0)", 0.5],
					expect: [0.1, 0.05, 60, 0.5],
				},
				{
					name: "Jzczhz hue is fixed up along the shorter arc",
					description: `Hues are not normalized back into [0, 360) after fix-up,
					so the midpoint of the 350 → 380 arc is 365.`,
					data: { options: { space: "jzczhz" } },
					args: ["color(jzczhz 0.1 0.05 350)", "color(jzczhz 0.1 0.05 20)", 0.5],
					expect: [0.1, 0.05, 365, 1],
				},
			],
		},
		{
			name: "Premultiplied alpha in rectangular spaces",
			description:
				"All coordinates are premultiplied, and zero alpha still must not divide by zero.",
			data: { options: { space: "srgb", premultiplied: true } },
			tests: [
				{
					name: "red to transparent stays red",
					description: `"transparent" is rgba(0, 0, 0, 0), so without premultiplication
					this would pass through gray. Premultiplied, it stays fully saturated red.`,
					args: ["red", "transparent", 0.5],
					expect: [1, 0, 0, 0.5],
				},
				{
					name: "Zero alpha does not divide by zero",
					args: ["red", "transparent", 1],
					expect: [0, 0, 0, 0],
				},
			],
		},
		{
			name: "Missing alpha",
			description: `A missing component is treated as having the other color's value, and premultiplication
			must use that carried forward value. If both alphas are missing, alpha stays missing and no
			premultiplication happens at all.
			See <a href="https://drafts.csswg.org/css-color-4/#interpolation-missing">CSS Color 4 § 13.2</a>.`,
			data: { options: { space: "oklch", premultiplied: true } },
			tests: [
				{
					name: "Both alphas missing: alpha stays missing, coords are not premultiplied",
					args: ["oklch(80% 0.2 30 / none)", "oklch(40% 0.1 90 / none)", 0.5],
					expect: [0.6, 0.15, 60, null],
				},
				{
					name: "One alpha missing: carried forward from the other color",
					description: `The missing alpha becomes 0.5, so both colors are premultiplied by 0.5,
					which gives the same result as interpolating without premultiplication.
					It must not be treated as zero, which would premultiply every coordinate to 0.`,
					args: ["oklch(80% 0.2 30 / none)", "oklch(40% 0.1 90 / 0.5)", 0.5],
					expect: [0.6, 0.15, 60, 0.5],
				},
				{
					name: "One alpha missing, in Jzczhz",
					data: { options: { space: "jzczhz", premultiplied: true } },
					args: [
						"color(jzczhz 0.1 0.05 30 / none)",
						"color(jzczhz 0.05 0.02 90 / 0.4)",
						0.5,
					],
					expect: [0.075, 0.035, 60, 0.4],
				},
			],
		},
		{
			name: "Missing hue",
			description: `A missing hue takes the other color's hue, so that the interpolation stays
			on a single hue rather than sweeping towards 0deg.`,
			data: { options: { space: "oklch" } },
			tests: [
				{
					name: "CSS Color 4 example: oklch(39.2% 0.4 none) keeps the hue 326.5",
					args: ["oklch(78.3% 0.108 326.5)", "oklch(39.2% 0.4 none)", 0.5],
					expect: [0.5875, 0.254, 326.5, 1],
				},
			],
		},
		{
			name: "CSS Color 4 examples",
			description: `Worked examples from
			<a href="https://drafts.csswg.org/css-color-4/#interpolation-alpha">CSS Color 4 § 13.3</a>.
			The expected values are the ones given in the spec, which are computed from rounded
			intermediate values, hence the looser epsilon.`,
			check: checkColor({ epsilon: 0.02 }),
			tests: [
				{
					name: "Premultiplied sRGB",
					description: `rgb(24% 12% 98% / 0.4) and rgb(62% 26% 64% / 0.6) premultiply to
					[9.6% 4.8% 39.2%] and [37.2% 15.6% 38.4%], whose midpoint [23.4% 10.2% 38.8%]
					un-premultiplies to rgb(46.8% 20.4% 77.6% / 0.5).`,
					data: { options: { space: "srgb", premultiplied: true } },
					args: ["rgb(24% 12% 98% / 0.4)", "rgb(62% 26% 64% / 0.6)", 0.5],
					expect: [0.468, 0.204, 0.776, 0.5],
				},
				{
					name: "Premultiplied Lab",
					description: "Expected: lab(58.873% 51.552 7.108 / 0.5).",
					data: { options: { space: "lab", premultiplied: true } },
					args: ["rgb(76% 62% 03% / 0.4)", "color(display-p3 0.84 0.19 0.72 / 0.6)", 0.5],
					expect: [58.873, 51.552, 7.108, 0.5],
				},
				{
					name: "Premultiplied LCH, where the hue is not premultiplied",
					description: `Expected: lch(58.873% 81.126 31.82 / 0.5).
					The hue is 391.82 rather than 31.82 because hues are not normalized back into
					[0, 360) after the shorter arc fix-up; 391.82 - 360 = 31.82.`,
					data: { options: { space: "lch", premultiplied: true } },
					args: ["rgb(76% 62% 03% / 0.4)", "color(display-p3 0.84 0.19 0.72 / 0.6)", 0.5],
					expect: [58.873, 81.126, 391.82, 0.5],
				},
				{
					name: "Premultiplied Oklch, with a missing alpha carried forward",
					description: `oklch(78.3% 0.108 326.5 / 0.5) and oklch(39.2% 0.4 0 / none):
					the missing alpha becomes 0.5, giving the premultiplied values
					[0.3915 0.054 326.5] and [0.196 0.2 360]. The spec's gradient for this example
					has oklch(58.75% 0.254 343.25 / 0.5) at its midpoint.`,
					data: { options: { space: "oklch", premultiplied: true } },
					args: ["oklch(78.3% 0.108 326.5 / 0.5)", "oklch(39.2% 0.4 0 / none)", 0.5],
					expect: [0.5875, 0.254, 343.25, 0.5],
				},
			],
		},
	],
};
