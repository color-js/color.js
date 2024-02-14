import Color from "../../dist/color.js";
import methods from "./methods.js";

const lch = ["L", "C", "H"];
let spacesToShow = [Color.spaces.oklch, Color.spaces.p3, Color.spaces["p3-linear"]]

export default {
	props: {
		modelValue: String
	},
	emits: ["update:modelValue"],
	data () {
		let defaultValue = "oklch(90% .8 250)";
		let color;

		try {
			color = new Color(this.modelValue);
		}
		catch (e) {
			color = new Color("transparent");
		}

		return {
			color,
			colorNullable: color,
			defaultValue,
			methods,
			Color,
			lch: ["L", "C", "H"],
		};
	},

	computed: {
		colorInput: {
			get () {
				return this.modelValue;
			},
			set (value) {
				this.$emit("update:modelValue", value);
			}
		},
		colorLCH () {
			return this.color.to("oklch");
		},

		spaces () {
			return spacesToShow.map(space => {
				let coordInfo = Object.entries(space.coords);
				let coords = this.color.to(space).coords.map(c => this.toPrecision(c, 3));
				return {
					name: space.name,
					coords: Object.fromEntries(coordInfo.map(([c, info], i) => [c, {value: coords[i], name: info.name, id: c}]))
				}
			});
		},

		mapped () {
			return Object.fromEntries(Object.entries(this.methods).map(([method, config]) => {
				let mappedColor;
				if (config.compute) {
					mappedColor = config.compute(this.color);
				}
				else {
					mappedColor = this.color.clone().toGamut({ space: "p3", method });
				}

				let mappedColorLCH = mappedColor.to("oklch");
				let deltas = {E: this.toPrecision(this.color.deltaE(mappedColor, { method: "2000" }), 2)};

				lch.forEach((c, i) => {
					let delta = mappedColorLCH.coords[i] - this.colorLCH.coords[i];

					if (c === "L") {
						// L is percentage
						delta *= 100;
					}
					else if (c === "H") {
						// Hue is angular, so we need to normalize it
						delta = ((delta % 360) + 720) % 360;
						delta = Math.min(360 - delta, delta);
					}

					delta = this.toPrecision(delta, 2);
					deltas[c] = delta;
				});

				return [method, {color: mappedColor, deltas}];
			}));
		},

		minDeltas () {
			let ret = {};
			for (let method in this.mapped) {
				let {deltas} = this.mapped[method];

				for (let c in deltas) {
					let delta = Math.abs(deltas[c]);
					let minDelta = ret[c];

					if (!minDelta || minDelta >= delta) {
						ret[c] = delta;
					}
				}
			}
			return ret;
		},

		ranking () {
			let deltaEs = Object.entries(this.mapped).map(([method, {deltas}]) => deltas.E);
			deltaEs = deltaEs.map(e => this.toPrecision(e, 2));
			deltaEs.sort((a, b) => a - b);
			return deltaEs;
		}
	},

	methods: {
		toPrecision: Color.util.toPrecision,
		abs: Math.abs
	},

	watch: {
		colorNullable () {
			if (this.colorNullable === null) {
				// Probably typing
				return;
			}

			this.color = this.colorNullable;
		},
	},

	compilerOptions: {
		isCustomElement (tag) {
			return tag === "css-color";
		},
	},

	template: `
		<section class="rendering">
			<h2>Browser rendering</h2>

			<dl class="swatches">
				<div>
					<dt>Input
						<small class="description">The color as displayed directly by the browser.</small>
					</dt>
					<dd>
						<css-color swatch="large" @colorchange="event => colorNullable = event.detail.color" :value="colorInput">
							<input v-model="colorInput" />
						</css-color>
						<details class="space-coords">
							<summary>Raw coordinates</summary>
							<dl class="space-coords">
								<div v-for="(space, spaceIndex) of spaces">
									<dt>{{ space.name }}</dt>
									<dd>
										<dl class="coords">
											<div v-for="(info, c) of space.coords">
												<dt :title="info.name">{{ c.toUpperCase() }}</dt>
												<dd>{{ toPrecision(info.value, 3) }}</dd>
											</div>
										</dl>
									</dd>
								</div>
							</dl>
						</details>
					</dd>
				</div>
			</dl>
		</section>

		<section class="gamut-mapped">
			<h2>Gamut mapped</h2>

			<dl class="swatches">
				<div v-for="(config, method) in methods" :id="'method-' + method" data-ranking="ranking.findIndex(e => e === mapped[method]?.deltas.E) + 1">
					<dt>
						{{ config.label ?? method[0].toUpperCase() + method.slice(1) }}
						<small v-if="config.description" class="description">{{ config.description }}</small>
					</dt>
					<dd>
						<css-color swatch="large" :color="mapped[method].color"></css-color>
						<dl class="deltas" v-if="!color.inGamut('p3')">
							<div v-for="(delta, c) of mapped[method].deltas" :class="'delta-' + c.toLowerCase()">
								<dt>Δ{{ c }}</dt>
								<dd :class="{
									positive: c !== 'E' && delta > 0,
									negative: delta < 0,
									zero: delta === 0,
									min: minDeltas[c] === abs(delta),
								}">{{ delta }}</dd>
							</div>
						</dl>
					</dd>
				</div>
			</dl>
		</section>`
};