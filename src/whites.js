export default {
	// from ASTM E308-01
	// D50: [0.96422, 1.00000, 0.82521],
	// D65: [0.95047, 1.00000, 1.08883],
	// for compatibility, the four-digit chromaticity-derived ones everyone else uses
	D50: [0.3457 / 0.3585, 1.00000, (1.0 - 0.3457 - 0.3585) / 0.3585],
	D65: [0.3127 / 0.3290, 1.00000, (1.0 - 0.3127 - 0.3290) / 0.3290],
}