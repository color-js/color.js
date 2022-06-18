/**
 * This plugin defines getters and setters for color[spaceId]
 * e.g. color.lch on *any* color gives us the lch coords
 */
import ColorSpace from "./space.js";
import Color from "./color.js";
import hooks from "./hooks.js";

// Add space accessors to existing color spaces
for (let id in ColorSpace.registry) {
	addSpaceAccessors(id, ColorSpace.registry[id]);
}

// Add space accessors to color spaces not yet created
hooks.add("colorspace-init-end", addSpaceAccessors);

function addSpaceAccessors (id, space) {
	// Coordinates can be looked up by both id and name
	let coordIds = Object.keys(space.coords);
	let coordNames = Object.values(space.coords).map(c => c.name);

	Object.defineProperty(Color.prototype, id, {
		// Convert coords to coords in another colorspace and return them
		// Source colorspace: this.spaceId
		// Target colorspace: id
		get () {
			let ret = Color.convert(this.coords, this.space, id);

			if (typeof Proxy === "undefined") {
				// If proxies are not supported, just return a static array
				return ret;
			}

			// Enable color.spaceId.coordName syntax
			return new Proxy(ret, {
				has: (obj, property) => {
					return coordIds.includes(property) || coordNames.includes(property) || Reflect.has(obj, property);
				},
				get: (obj, property, receiver) => {
					if (property && !(property in obj)) {
						let i = coordIds.indexOf(property);

						if (i === -1) {
							// If id not found, maybe name is?
							i = coordNames.indexOf(property);
						}

						if (i > -1) {
							return obj[i];
						}
					}

					return Reflect.get(obj, property, receiver);
				},
				set: (obj, property, value, receiver) => {
					if (property && !(property in obj) || property >= 0) {
						let i = coordIds.findIndex(id => id.toLowerCase() === property.toLowerCase());

						if (i === -1) {
							// If id not found, maybe name is?
							i = coordNames.findIndex(name => name.toLowerCase() === property.toLowerCase());
						}

						if (property > -1) { // Is property a numerical index?
							i = property; // next if will take care of modifying the color
						}

						if (i > -1) {
							obj[i] = value;

							// Update color.coords
							this.coords = Color.convert(obj, id, this.spaceId);

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
			this.coords = Color.convert(coords, id, this.spaceId);
		},
		configurable: true,
		enumerable: true
	});
}