import Color from "../../dist/color.js";
// const styles = await fetch("./style.css").then(r => r.text());

const gamuts = ["srgb", "p3", "rec2020"];

let styleURL = new URL("./style.css", import.meta.url);
let importIncrementable = import("https://incrementable.verou.me/incrementable.mjs").then(m => m.default);

export default class CSSColor extends HTMLElement {
	#dom = {};

	constructor () {
		super();
		this.attachShadow({mode: 'open'});
		this.shadowRoot.innerHTML = `
			<style>@import url("${ styleURL }")</style>
			<slot name="swatch">
				<div id="swatch" part="swatch"></div>
			</slot>
			<div id="wrapper">
				<slot></slot>
				<span id="gamut" part="gamut"></span>
			</div>
		`;
	}

	#initialized

	connectedCallback () {
		if (!this.#initialized) {
			this.#initialize();
		}

		// This should eventually be a custom state
		this.#dom.wrapper.classList.toggle("static", !this.#dom.input);

		if (this.#dom.input) {
			if (!this.#dom.input.incrementable) {
				// Increment numbers by keyboard arrow keys
				importIncrementable.then(Incrementable => new Incrementable(this.#dom.input));
			}
		}

		this.#render();
	}

	#errorTimeout;

	#initialize () {
		this.#dom.wrapper = this.shadowRoot.querySelector("#wrapper");
		this.#dom.input = this.querySelector("input");
		this.#dom.gamutIndicator = this.shadowRoot.querySelector("#gamut");

		if (this.#dom.input) {
			this.#dom.input.addEventListener("input", evt => {
				this.#render();
			});
		}
		this.#initialized = true;
	}

	#render () {
		if (!this.#initialized) {
			return;
		}

		clearTimeout(this.#errorTimeout);

		if (!this.isConnected) {
			return;
		}

		let value = this.value;
		this.#color = null;

		if (value) {
			try {
				this.#color = new Color(value);
			}
			catch (e) {
				// Why a timeout? We don't want to produce errors for intermediate states while typing,
				// but if this is a genuine error, we do want to communicate it.

				this.#errorTimeout = setTimeout(_ => this.#dom.input?.setCustomValidity(e.message), 500);
			}

			if (this.#color) {
				this.#setColor(this.#color);
				this.#dom.input?.setCustomValidity("");
			}

			this.dispatchEvent(new CustomEvent("colorchange", {
				detail: {
					color: this.#color
				}
			}));
		}

		if (this.#color) {
			this.#renderGamut();
		}
	}

	#renderGamut () {
		if (this.#color) {
			let gamut = gamuts.find(gamut => this.#color.inGamut(gamut)) ?? "";
			this.dataset.gamut = this.#gamut = gamut;
		}
		else {
			this.#gamut = null;
			this.removeAttribute("data-gamut");
		}
	}

	#gamut
	get gamut () {
		return this.#gamut;
	}

	get value () {
		return this.#dom.input?.value ?? this.textContent.trim()
	}

	set value (value) {
		let oldValue = this.value;
		if (value === oldValue) {
			return;
		}
		this.#setValue(value);
		this.#render();
	}

	#setValue (value) {
		if (!this.#initialized) {
			this.#initialize();
		}

		if (this.#dom.input) {
			this.#dom.input.value = value;
		}
		else {
			this.textContent = value;
		}
	}

	#color
	get color () {
		return this.#color;
	}

	set color (color) {
		if (typeof color === "string") {
			color = new Color(color);
		}

		this.#setColor(color);
		this.#setValue(color.toString({ precision: 2, inGamut: false}));
		this.#renderGamut();
	}

	#setColor (color) {
		this.#color = color;

		try {
			this.style.setProperty("--color", this.#color.display({inGamut: false}));
		}
		catch (e) {
			this.style.setProperty("--color", this.value);
		}
	}

	static observedAttributes = ["for"];
}

customElements.define("css-color", CSSColor);