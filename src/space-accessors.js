/**
 * This plugin defines getters and setters for color[spaceId]
 * e.g. color.lch on *any* color gives us the lch coords
 */
import ColorSpace from "./ColorSpace.js";
import Color from "./color.js";
import hooks from "./hooks.js";

// Add space accessors to existing color spaces
for (let id in ColorSpace.registry) {
	addSpaceAccessors(id, ColorSpace.registry[id]);
}

// Add space accessors to color spaces not yet created
hooks.add("colorspace-init-end", space => {
	addSpaceAccessors(space.id, space);
	space.aliases?.forEach(alias => {
		addSpaceAccessors(alias, space);
	});
});

function addSpaceAccessors (id, space) {
	let propId = id.replace(/-/g, "_");

	Object.defineProperty(Color.prototype, propId, {
		// Convert coords to coords in another colorspace and return them
		// Source colorspace: this.spaceId
		// Target colorspace: id
		get () {
			let ret = this.getAll(id);

			if (typeof Proxy === "undefined") {
				// If proxies are not supported, just return a static array
				return ret;
			}

			// Enable color.spaceId.coordName syntax
			return new Proxy(ret, {
				has: /** @param {string} property */ (obj, property) => {
					try {
						ColorSpace.resolveCoord([space, property]);
						return true;
					}
					catch (e) {}

					return Reflect.has(obj, property);
				},
				get: (obj, property, receiver) => {
					if (property && typeof property !== "symbol" && !(property in obj)) {
						let {index} = ColorSpace.resolveCoord([space, property]);

						if (index >= 0) {
							return obj[index];
						}
					}

					return Reflect.get(obj, property, receiver);
				},
				set: (obj, property, value, receiver) => {
					if (property && typeof property !== "symbol" && !(property in obj) || property >= 0) {
						let {index} = ColorSpace.resolveCoord([space, /** @type {string} */ (property)]);

						if (index >= 0) {
							obj[index] = value;

							// Update color.coords
							this.setAll(id, obj);

							return true;
						}
					}

					return Reflect.set(obj, property, value, receiver);
				},
			});
		},
		// Convert coords in another colorspace to internal coords and set them
		// Target colorspace: this.spaceId
		// Source colorspace: id
		set (coords) {
			this.setAll(id, coords);
		},
		configurable: true,
		enumerable: true,
	});
}
