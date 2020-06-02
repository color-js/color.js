import Color, {util} from "./color.js";
// More accurate color-difference formulae
// than the simple 1976 Euclidean distance in Lab

// Uses JzCzHz, which has improved perceptual uniformity
// and thus a simple Euclidean root-sum of ΔL² ΔC² ΔH²
// gives good results.


Color.deltaEs["Jz"] = function (color, sample) {
	// Given this color as the reference
	// and a sample,
	// calculate deltaE in JzCzHz.

    let [Jz1, Cz1, Hz1] = color.jzczhz;
    let [Jz2, Cz2, Hz2] = sample.jzczhz;
	let [L2, a2, b2] = sample.lab;
	// console.log({L1, a1, b1});
	// console.log({L2, a2, b2});

    // Lightness and Chroma differences
    // sign does not matter as they are squared.
	let ΔJ = Jz1 - Jz2;
	let ΔC = Cz1 - Cz2;
	// console.log({ΔL});
    // console.log({ΔC});

	// length of chord for ΔH
	let Δh = Hz1 - Hz2;
	let ΔH = 2 * Math.sqrt(Cz1 * Cz2) * sin(Δh * Math.PI / 180);
	// console.log({ΔH});

	return Math.sqrt(ΔJ ** 2 + ΔC ** 2 + ΔH ** 2);
