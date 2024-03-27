import Color from "../../dist/color.js";
import ColorGamut from "../color-gamut/color-gamut.js";
// const styles = await fetch("./style.css").then(r => r.text());

const gamuts = ["srgb", "p3", "rec2020"];

let styleURL = new URL("./style.css", import.meta.url);
let importIncrementable = import("https://incrementable.verou.me/incrementable.mjs").then(m => m.default);

export default class CSSColor extends HTMLElement {
	#dom = {};

	constructor () {
		super();
		this.attachShadow({mode: "open"});
		this.shadowRoot.innerHTML = `
			<style>@import url("${ styleURL }")</style>
			<slot name="swatch">
				<div id="swatch" part="swatch"></div>
			</slot>
			<div id="wrapper">
				<slot name="before"></slot>
				<div part="color-wrapper">
					<slot></slot>
				</div>
				<slot name="after"></slot>
			</div>
		`;
	}

	#initialized;

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
	#cs;
	#scopeRoot;

	// Gets called when the element is connected for the first time
	#initialize ({force} = {}) {
		if (!force && this.#initialized) {
			return;
		}

		this.#initialized = true;

		this.#dom.wrapper = this.shadowRoot.querySelector("#wrapper");
		this.#dom.colorWrapper = this.shadowRoot.querySelector("[part=color-wrapper]");
		this.#dom.input = this.querySelector("input");

		if (this.#dom.input) {
			this.#dom.input.addEventListener("input", evt => {
				this.#render(evt);
			});
		}

		this.verbatim = this.hasAttribute("verbatim");

		if (this.verbatim) {
			// Cannot display gamut info without parsing the color
			this.setAttribute("gamuts", "none");
		}

		this.gamuts = null;
		if (!this.matches('[gamuts="none"]')) {
			this.gamuts = this.getAttribute("gamuts") ?? "srgb, p3, rec2020: P3+, prophoto: PP";
			this.#dom.gamutIndicator = document.createElement("color-gamut");

			Object.assign(this.#dom.gamutIndicator, {
				gamuts: this.gamuts,
				id: "gamut",
				part: "gamut",
				exportparts: "label: gamutlabel",
			});

			this.#dom.colorWrapper.appendChild(this.#dom.gamutIndicator);

			this.#dom.gamutIndicator.addEventListener("gamutchange", evt => {
				this.setAttribute("gamut", evt.detail.gamut);
				this.dispatchEvent(new CustomEvent("gamutchange", {
					detail: evt.detail,
				}));
			});
		}

		if (this.hasAttribute("property")) {
			this.property = this.getAttribute("property");
			this.scope = this.getAttribute("scope") ?? ":root";
			this.#dom.style = document.createElement("style");
			document.head.appendChild(this.#dom.style);

			let varRef = `var(${this.property})`;
			if (this.verbatim) {
				this.style.setProperty("--color", varRef);
				this.value ||= varRef;
			}
			else {
				let scopeRoot = this.closest(this.scope);

				// Is contained within scope root
				if (scopeRoot) {
					this.style.setProperty("--color", varRef);
				}

				scopeRoot ??= document.querySelector(this.scope);

				if (scopeRoot) {
					let cs = getComputedStyle(scopeRoot);
					this.value = cs.getPropertyValue(this.property);
				}
			}
		}
	}

	#render (evt) {
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
					color: this.#color,
				},
			}));
		}
	}

	get gamut () {
		return this.#dom.gamutIndicator.gamut;
	}

	get value () {
		return this.#dom.input?.value ?? this.textContent.trim();
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

	#color;
	get color () {
		return this.#color;
	}

	set color (color) {
		if (typeof color === "string") {
			color = new Color(color);
		}

		this.#setColor(color);

		let colorString;
		if (this.verbatim && this.property) {
			colorString = `var(${this.property})`;
		}
		else {
			colorString = color.toString({ precision: 2, inGamut: false });
		}
		this.#setValue(colorString);
	}

	#setColor (color) {
		this.#color = color;
		let colorString;

		if (this.verbatim && this.property) {
			colorString = `var(${this.property})`;
		}
		else {
			try {
				colorString = this.#color.display({inGamut: false});

			}
			catch (e) {
				colorString = this.value;
			}
		}

		if (this.value === colorString) {
			return;
		}

		this.style.setProperty("--color", colorString);

		if (this.property) {
			this.#dom.style.textContent = `${this.scope} { ${this.property}: ${colorString}; }`;
		}

		if (this.#dom.gamutIndicator) {
			this.#dom.gamutIndicator.color = this.#color;
		}
	}

	static observedAttributes = ["for", "property"];
}

customElements.define("css-color", CSSColor);
