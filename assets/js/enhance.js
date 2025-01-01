export function styleCallouts(
	elements = document.querySelectorAll("p"),
	labels = ["Tip", "Warning", "Note"],
) {
	let maxLabelLength = Math.max(...labels.map(l => l.length));
	labels = new RegExp(`(${labels.join("|")}):`);

	for (let p of elements) {
		let callout = p.textContent
			.trimLeft()
			.slice(0, maxLabelLength + 2)
			.match(labels)?.[1];

		if (callout) {
			p.classList.add(callout.toLowerCase());
			p.firstChild.textContent = p.firstChild.textContent.replace(callout + ":", "");
		}
	}
}

// Do not use, this is broken
// export function linkifyAPI () {
// 	for (let code of $$(":not(pre) > code")) {
// 		let text = code.textContent;
// 		let match = text.match(/([Cc]olor).(\w+)\(\)/);

// 		if (match) {
// 			$.create("a", {
// 				href: `/api/#Color${match[1] === "Color" ? "." : "#"}${match[2]}`,
// 				around: code,
// 			});
// 		}
// 	}
// }
