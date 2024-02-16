export default function clone (color) {
	return {
		space: color.space,
		coords: color.coords.slice(),
		alpha: color.alpha,
	};
}
