import Color from "../../dist/color.js";

const gamuts = ["srgb", "p3", "rec2020"];

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

		this.attributeChangedCallback();

		let textContent = this.textContent;

		if (textContent) {
			this.color ??= this.textContent;
		}
	}

	connectedCallback () {
		this.#render();
	}

	#render () {
		if (!this.isConnected) {
			return;
		}

		if (!this.#label) {
			this.#label = this.shadowRoot.querySelector("#label");
		}

		if (this.#color) {
			let gamut = null;

			for (let g in this.gamuts) {
				if (this.#color.inGamut(g)) {
					gamut = g;
					break;
				}
			}

			this.#setGamut(gamut);
		}
		else {
			this.#setGamut();
		}
	}

	#gamut;
	get gamut () {
		return this.#gamut;
	}

	#setGamut (gamut) {
		this.#gamut = gamut;

		if (gamut === undefined) {
			this.removeAttribute("gamut");
			this.style.removeProperty("--gamut-level");
			this.#label.textContent = "";
			return;
		}

		let label = "";
		let level = -1;
		let levels = Object.entries(this.gamuts);
		if (gamut === null) {
			// Outside all gamuts
			this.setAttribute("gamut", "none");
			level = levels.length;
			label = levels.at(-1)[1] + "+";
		}
		else {
			this.setAttribute("gamut", gamut);
			label = this.gamuts[gamut];
			level = levels.findIndex(([id]) => id === gamut);
		}

		this.#label.textContent = label;
		this.style.setProperty("--gamut-level", level);
	}

	#color;
	get color () {
		return this.#color;
	}

	set color (color) {
		if (!(color instanceof Color)) {
			color = new Color(color);
		}

		this.#color = color;
		this.#render();
	}

	static observedAttributes = ["gamuts"];
	static defaultGamuts = ["srgb", "p3", "rec2020"];

	attributeChangedCallback (name, oldValue, newValue) {
		if (!name || name === "gamuts") {
			if (newValue === undefined) {
				newValue = this.getAttribute("gamuts");
			}

			if (oldValue !== newValue) {
				this.gamuts = this.constructor.parseGamuts(newValue ?? this.constructor.defaultGamuts);
				this.#render();
			}
		}
	}

	static parseGamuts (gamuts) {
		if (typeof gamuts === "string") {
			gamuts = gamuts.trim().split(/\s*,\s*/);
		}

		return Object.fromEntries(gamuts.map(gamut => {
			gamut = gamut.trim();
			let [id, label = Color.spaces[gamut]?.name ?? gamut] = gamut.split(/\s*:\s*/);
			return [id, label];
		}));

	}
}

customElements.define("color-gamut", ColorGamut);
