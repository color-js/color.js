import Color from "../../dist/color.js";

let styleURL = new URL("./style.css", import.meta.url);

export default class ColorGamut extends HTMLElement {
	#label;

	constructor () {
		super();
		this.attachShadow({mode: "open"});
		this.shadowRoot.innerHTML = `
			<style>@import url("${ styleURL }")</style>
			<span id="label" part="label"></span>
		`;

		if (this.hasOwnProperty("gamuts")) {
			this.gamuts = this.gamuts;
		}
	}

	connectedCallback () {
		this.#initialize();
		this.#render();
	}

	#initialized;
	#initialize () {
		if (this.#initialized) {
			return;
		}

		this.#initialized = true;

		this.attributeChangedCallback();

		let textContent = this.textContent;

		if (textContent) {
			this.color ??= this.textContent;
		}
	}

	#render () {
		if (!this.isConnected) {
			return;
		}

		if (!this.#label) {
			this.#label = this.shadowRoot.querySelector("#label");
		}

		this.#updateGamut();
	}

	#gamut;
	get gamut () {
		return this.#gamut?.id;
	}

	get gamutLabel () {
		return this.#gamut?.label ?? "";
	}

	#gamuts;
	get gamuts () {
		return this.#gamuts;
	}

	set gamuts (gamuts) {

		this.#gamuts = this.constructor.parseGamuts(gamuts);
	}

	#updateGamut () {
		if (!this.#color) {
			this.#setGamut();
			return;
		}

		let gamut = this.gamuts.find(gamut => gamut.id === "none" || this.#color.inGamut(gamut.id));
		this.#setGamut(gamut);
	}

	#setGamut (gamut) {
		let oldGamut = this.#gamut;

		if (gamut === oldGamut) {
			return;
		}

		this.#gamut = gamut;
		this.#label.textContent = this.#gamut?.label ?? "";

		if (!gamut) {
			this.removeAttribute("gamut");
			this.style.removeProperty("--gamut-level");

			return;
		}

		this.setAttribute("gamut", gamut.id);
		this.style.setProperty("--gamut-level", gamut.level);

		this.dispatchEvent(new CustomEvent("gamutchange", {
			detail: {oldGamut, gamut},
		}));
	}

	#color;
	get color () {
		return this.#color;
	}

	set color (color) {
		this.#color = Color.get(color);
		this.#render();
	}

	static observedAttributes = ["gamuts"];

	attributeChangedCallback (name, oldValue, newValue) {
		if (!name && this.hasAttribute("gamuts") || name === "gamuts") {
			newValue ??= this.getAttribute("gamuts");

			if (oldValue !== newValue) {
				this.gamuts = this.constructor.parseGamuts(newValue ?? this.constructor.defaultGamuts);
				this.#render();
			}
		}
	}

	static defaultGamuts = ["srgb", "p3", "rec2020"];

	static parseGamuts (gamuts) {
		if (!gamuts) {
			return [];
		}

		if (typeof gamuts === "string") {
			gamuts = gamuts.trim().split(/\s*,\s*/);
		}
		else if (!Array.isArray(gamuts) && typeof gamuts === "object") {
			// Object
			return Object.entries(gamuts).map(([id, label]) => {id, label});
		}

		let ret = gamuts.map((gamut, level) => {
			if (gamut?.id && "label" in gamut) {
				// Already in the correct format
				return gamut;
			}

			gamut = gamut.trim().split(/\s*:\s*/);
			let id = gamut[0];
			let label = gamut[1] ?? Color.spaces[gamut]?.name ?? id;
			return {id, label, level};
		});

		if (!ret.find(gamut => gamut.id === "none")) {
			ret.push({
				id: "none",
				get label () {
					return ret[this.level - 1].label + "+";
				},
				level: ret.length,
			});
		}

		return ret;
	}
}

customElements.define("color-gamut", ColorGamut);
