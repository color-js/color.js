let tests = await Promise.all(
	["conversions", "adapt", "angles", "construct", "delta", "gamut"].map(
		(name) => import(`./${name}.js`).then((module) => module.default),
	),
);

export default {
	name: "All Color.js tests",
	tests,
};
