import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

import defaultConfig from "./rollup.config.js";

const legacyPlugins = [
	commonjs({ strictRequires: true }),
	nodeResolve({ ignoreSideEffectsForRoot: true }),
	babel({ babelHelpers: "bundled", exclude: "node_modules/**" }),
];

export default defaultConfig.map(config =>
	Object.assign(config, {
		output: config.output.map(bundle => ({
			...bundle,
			file: bundle.file.replace(/\.(?:min\.)?\w+$/, ".legacy$&"),
		})),
		plugins: [...(config.plugins || []), ...legacyPlugins],
	}),
);
