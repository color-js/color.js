let tests = await Promise.all([
	"conversions",
].map(name => import(`./${name}.js`).then(module => module.default)));


export default {
	name: "All Color.js tests",
	tests
}