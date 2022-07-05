import Color from "../../src/index.js";

export default class ColorSwatch extends HTMLElement {
	#swatch

	constructor() {
		super();
		this.attachShadow({mode: "open"});
		this.shadowRoot.innerHTML = `<style>@import url("./color-swatch.css");</style>
		<div id="swatch" part="swatch"></div>
		<slot></slot>`;
		this.#swatch = this.shadowRoot.querySelector("#swatch");
	}

	connectedCallback() {
		this.#render();
		ColorSwatch.#mo.observe(this, {childList: true, subtree: true, characterData: true});
	}

	#value
	get value() {
		return this.#value;
	}
	set value(value) {
		this.#value = value;
		this.#render();
	}

	#color
	get color() {
		return this.#color;
	}

	#render() {
		let colorText = this.value || this.textContent;

		try {
			this.#color = new Color(colorText);
			this.#swatch.style.cssText = `--color: ${this.#color.display()}`;
			this.#swatch.classList.remove("invalid");
		}
		catch (e) {
			this.#color = null;
			this.#swatch.classList.add("invalid");
		}
	}

	static get observedAttributes() {
		return ["value"];
	}

	attributeChangedCallback(name, newValue) {
		if (name === "value") {
			this.value = newValue;
		}
	}

	static #mo = new MutationObserver(mutations => {
		for (let mutation of mutations) {
			let target = mutation.target;

			while (target && !(target instanceof ColorSwatch)) {
				target = target.parentNode;
			}

			if (target) {
				target.#render();
			}
		}
	})
}


customElements.define('color-swatch', ColorSwatch);