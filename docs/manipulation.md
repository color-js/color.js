# Steps in CIE XYZ

```js
let white= new Color("white").to("absxyzd65");
let step;
for (let i=0;i<=100;i+=5) {
	step = white.coords.map(x => x * i / 100);
}
```
