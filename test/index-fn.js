let tests = await Promise.all([
	"conversions",
	"adapt",
	"angles",
	"construct",
	"delta",
	"gamut",
	"in_gamut",
	"parse",
].map(name => import(`./${name}.js`).then(module => module.default)));


export default {
	name: "All Color.js tests",
	tests,
};
