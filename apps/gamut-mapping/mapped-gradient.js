import methods from "./methods.js";

export default {
	props: {
		method: String | Object,
		steps: Array,
	},

	emits: ["report-time"],

	data () {
		return {
			time: 0,
			mappedSteps: [],
		};
	},

	computed: {
		name () {
			return methods[this.method]?.label || "None";
		},
	},

	methods: {
		mapSteps () {
			const start = performance.now();
			let steps = this.steps.map(step => {
				let mappedColor;
				if (this.method === "none") {
					return step;
				}
				if (methods[this.method].compute) {
					mappedColor = methods[this.method].compute(step);
				}
				else {
					mappedColor = step.clone().toGamut({ space: "p3", method: this.method });
				}
				return mappedColor;
			});
			this.time = Color.util.toPrecision(performance.now() - start, 4);
			this.$emit("report-time", {time: this.time, method: this.method});
			this.mappedSteps = steps;
		},
	},

	watch: {
		steps: {
			handler () {
				this.mapSteps();
			},
			immediate: true,
		},
	},

	compilerOptions: {
		isCustomElement (tag) {
			return tag === "css-color";
		},
	},

	template: `
	<div class="mapped-gradient">
		<div class="info"><strong>{{ name }}</strong> {{time}}ms</div>
		<div class="gradient" :title="name">
			<div v-for="step in mappedSteps" :style="{'--step-color': step}" :title="name + ' ' + step"></div>
		</div>
	</div>
		`,
};
