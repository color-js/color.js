import methods from "./methods.js";
import Color from "../../dist/color.js";

export default {
	props: {
		runResults: Object,
	},

	computed: {
		results () {
			const [none, ...methodsTested] = Object.keys(this.runResults);
			return methodsTested.map(method => {
				const data = this.runResults[method];
				const total = data.reduce((acc, value) => acc + value);

				return {
					id: method,
					name: methods[method].label,
					metrics: {
						runs: data.length,
						min: Color.util.toPrecision(Math.min(...data), 8),
						max: Color.util.toPrecision(Math.max(...data), 8),
						mean: Color.util.toPrecision(total / data.length, 8),
					},
				};
			}).sort((a, b) => a.metrics.mean - b.metrics.mean);
		},
	},
	template: `
	<details class="timing-info"><summary>Timing info</summary>
		<dl>
			<div v-for="method in results" :key="method.id" class="timing-result">
				<dt><strong>{{ method.name }}</strong></dt>
				<dd>
					<dl class="metric">
						<div v-for="(value, metric) of method.metrics">
							<dt :title="metric">{{ metric.toUpperCase() }}</dt>
							<dd>{{ value }}</dd>
						</div>
					</dl>
				</dd>
			</div>
		</dl>
	</details>
	`,
};

