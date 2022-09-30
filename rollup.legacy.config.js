import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

import defaultConfig from './rollup.config.js';

const legacyPlugins = [
	commonjs(),
	nodeResolve(),
	babel({ babelHelpers: "bundled", exclude: "node_modules/**" }),
];

export default Object.assign(defaultConfig, {
	output: defaultConfig.output.map(bundle => ({
		...bundle,
		file: bundle.file.replace(/\.(?:min\.)?\w+$/, ".legacy$&"),
	})),
	plugins: [...(defaultConfig.plugins || []), ...legacyPlugins]
});
