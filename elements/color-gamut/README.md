---
body_classes: cn-ignore
---
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

<form id=params>
<code>oklch(<input type=number id=l value=50>% <input type=number id=min_c value=30>&ndash;<input type=number id=max_c value=40>% <input type=number id=h value=50>)</code>
<p><label>Chroma increments: <input type=number id=c_step value="0.2" min="0">%</label>
</form>

<script type=module>
params.addEventListener("input", e => {
	let c_range = {min: Number(min_c.value), max: Number(max_c.value)};
	let step = Number(c_step.value);
	let colors = [];
	for (let c = c_range.min; c<= c_range.max; c+=step) {
		colors.push(`oklch(${l.value}% ${c.toLocaleString("en")}% ${h.value})`);
	}

	colors_tbody.innerHTML = colors.map(color => `
		<tr>
			<td>
				<code>${color}</code>
			</td>
			<td>
				<color-gamut>${color}</color-gamut>
			</td>
		</tr>`).join("\n");
});
params.dispatchEvent(new Event("input"));
</script>

<table>
	<thead>
		<tr>
			<th>Color</th>
			<th>Gamut</th>
		</tr>
	</thead>
	<tbody id=colors_tbody>
	</tbody>
</table>