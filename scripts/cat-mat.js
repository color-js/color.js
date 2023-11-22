import { create, all } from 'mathjs'
const config = {}
const math = create(all, config)

const d50 = [0.3457 / 0.3585, 1.00000, (1.0 - 0.3457 - 0.3585) / 0.3585]
const d65 = [0.3127 / 0.3290, 1.00000, (1.0 - 0.3127 - 0.3290) / 0.3290]

const bradford = [
    [0.8951000, 0.2664000, -0.1614000],
    [-0.7502000, 1.7135000, 0.0367000],
    [0.0389000, -0.0685000, 1.0296000]
]

const von_kries = [
    [0.4002400, 0.7076000, -0.0808100],
    [-0.2263000, 1.1653200, 0.0457000],
    [0.0000000, 0.0000000, 0.9182200]
]

const cat02 = [
    [0.7328000, 0.4296000, -0.1624000],
    [-0.7036000, 1.6975000, 0.0061000],
    [0.0030000, 0.0136000, 0.9834000]
]

const cat16 = [
    [  0.401288,  0.650173, -0.051461 ],
    [ -0.250268,  1.204414,  0.045854 ],
    [ -0.002079,  0.048952,  0.953127 ]
]

console.log('===== bradford =====')
console.log(bradford)
console.log('===== bradford inverse =====')
console.log(math.inv(bradford))

console.log('===== von kries =====')
console.log(von_kries)
console.log('===== von kries inverse =====')
console.log(math.inv(von_kries))

console.log('===== cat02 =====')
console.log(cat02)
console.log('===== cat02 inverse =====')
console.log(math.inv(cat02))

console.log('===== cat16 =====')
console.log(cat16)
console.log('===== cat16 inverse =====')
console.log(math.inv(cat16))
