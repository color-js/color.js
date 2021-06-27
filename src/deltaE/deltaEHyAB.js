import Color from "../color.js";

/**
 * HyAB distance of colors in an Lab-like color space.
 * Best used for large distances. Claims to outperform even DE2000 at that.
 * Said to be okay for small distances.
 * 
 * @see http://markfairchild.org/PDFs/PAP40.pdf
 * @param {Color} color           - The other color.
 * @param {Object} [options=]
 * @param {string?} options.space - Color space to run in.
 */
Color.prototype.distanceHyAB = function (color, {space = "lab"} = {}) {
    color = Color.get(color);
    space = Color.space(space);
    if (!(space.classification && space.classification.includes('labish'))) {
        throw new TypeError(`${space} does not have a Lab-like layout.`)
    }

    let coords1 = this[space.id];
    let coords2 = color[space.id];

    const [dL, da, db] = coords1.map((x, i) => x - coords2[i]);

    return Math.abs(dL) + Math.sqrt(da ** 2 + db ** 2);
}

Color.statify(["deltaEHyAB"]);