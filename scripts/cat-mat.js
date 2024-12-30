import { create, all } from "mathjs";
const config = {};
const math = create(all, config);

const d50 = [0.3457 / 0.3585, 1.0, (1.0 - 0.3457 - 0.3585) / 0.3585];
const d65 = [0.3127 / 0.329, 1.0, (1.0 - 0.3127 - 0.329) / 0.329];

const bradford = [
	[0.8951, 0.2664, -0.1614],
	[-0.7502, 1.7135, 0.0367],
	[0.0389, -0.0685, 1.0296],
];

const von_kries = [
	[0.40024, 0.7076, -0.08081],
	[-0.2263, 1.16532, 0.0457],
	[0.0, 0.0, 0.91822],
];

const cat02 = [
	[0.7328, 0.4296, -0.1624],
	[-0.7036, 1.6975, 0.0061],
	[0.003, 0.0136, 0.9834],
];

const cat16 = [
	[0.401288, 0.650173, -0.051461],
	[-0.250268, 1.204414, 0.045854],
	[-0.002079, 0.048952, 0.953127],
];

console.log("===== bradford =====");
console.log(bradford);
console.log("===== bradford inverse =====");
console.log(math.inv(bradford));

console.log("===== von kries =====");
console.log(von_kries);
console.log("===== von kries inverse =====");
console.log(math.inv(von_kries));

console.log("===== cat02 =====");
console.log(cat02);
console.log("===== cat02 inverse =====");
console.log(math.inv(cat02));

console.log("===== cat16 =====");
console.log(cat16);
console.log("===== cat16 inverse =====");
console.log(math.inv(cat16));
