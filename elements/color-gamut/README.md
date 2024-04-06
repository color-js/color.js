<script src="color-gamut.js" type="module"></script>
# &lt;color-gamut>

Gamut indicator. Used internally by `<css-color>`

## Usage

Static (only read once):
```html
<color-gamut>red</color-gamut>
```

Produces <color-gamut>red</color-gamut>

Dynamic:
```js
colorGamutElement.color = colorValue;
```

## Demo
<style>
	#params {
		background: linear-gradient(to right, var(--start-color), var(--end-color)) no-repeat top / 100% 1em;
		padding-top: 1.5em;
	}

	#colors_container_h {
		display: flex;
		height: 1em;
		margin-bottom: 1em;

		color-gamut {
			flex: 1;
			border-radius: 0;

			&::part(label) {
				display: none;
			}
		}
	}
</style>
<form id=params>
<code>oklch(<input type=number id=l value=50>% <input type=number id=min_c value=30>&ndash;<input type=number id=max_c value=40>% <input type=number id=h value=50>)</code>
<p><label>Chroma increments: <input type=number id=c_step value="0.2" min="0">%</label>
</form>

<script type=module>
params.addEventListener("input", e => {
	let c_range = {min: Number(min_c.value), max: Number(max_c.value)};
	let step = Number(c_step.value);
	let colors = [];
	let start = `oklch(${l.value}% ${c_range.min.toLocaleString("en")}% ${h.value})`;
	let end = `oklch(${l.value}% ${c_range.max.toLocaleString("en")}% ${h.value})`;

	params.style.setProperty("--start-color", start);
	params.style.setProperty("--end-color", end);

	for (let c = c_range.min; c<= c_range.max; c+=step) {
		colors.push(`oklch(${l.value}% ${c.toLocaleString("en")}% ${h.value})`);
	}

	let html = colors.map(color => `
		<color-gamut title="${color}">${color}</color-gamut>`).join("\n");
	colors_container_h.innerHTML = html;
	colors_container.innerHTML = html;
});
params.dispatchEvent(new Event("input"));
</script>

No label:

<div id=colors_container_h></div>

Default display:
<div id=colors_container></div>