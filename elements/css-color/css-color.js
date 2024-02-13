import Color from "https://colorjs.io/dist/color.js";
// const styles = await fetch("./style.css").then(r => r.text());

const gamuts = ["srgb", "p3", "rec2020"];

let importIncrementable = import("https://incrementable.verou.me/incrementable.mjs").then(m => m.default);

export default class CSSColor extends HTMLElement {
	#dom = {};

	constructor () {
		super();
		this.attachShadow({mode: 'open'});
		this.shadowRoot.innerHTML = `
			<style>@import url("./style.css")</style>
			<slot name="swatch">
				<div id="swatch" part="swatch"></div>
			</slot>
			<div id="wrapper">
				<slot></slot>
				<span id="gamut" part="gamut">P3</span>
			</div>
		`;

		this.#dom.wrapper = this.shadowRoot.querySelector("div");
		this.#dom.input = this.querySelector("input");
		this.#dom.gamutIndicator = this.shadowRoot.querySelector("#gamut");

		if (this.#dom.input) {
			this.addEventListener("input", evt => this.#render());

			// Increment numbers by keyboard arrow keys
			importIncrementable.then(Incrementable => new Incrementable(this.#dom.input));
		}
	}

	connectedCallback () {
		this.#render();
	}

	#errorTimeout;

	#render () {
		clearTimeout(this.#errorTimeout);

		if (!this.isConnected) {
			return;
		}

		let value = this.#dom.input?.value ?? this.textContent.trim();
		this.style.setProperty("--color", value);

		if (value) {
			try {
				this.color = new Color(value);
			}
			catch (e) {
				// Why a timeout? We don't want to produce errors for intermediate states while typing,
				// but if this is a genuine error, we do want to communicate it.
				this.#errorTimeout = setTimeout(_ => this.#dom.input?.setCustomValidity(e.message), 500);
				return;
			}

			this.#dom.input?.setCustomValidity("");

			let gamut = gamuts.find(gamut => this.color.inGamut(gamut)) ?? "sl";
			this.dataset.gamut = gamut;
		}
		else {
			this.dataset.gamut = "";
		}

	}

	static observedAttributes = ["for"];
}

customElements.define('css-color', CSSColor);