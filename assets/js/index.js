import "./prism.js";
import "https://blissfuljs.com/bliss.shy.js";
import "https://live.prismjs.com/src/prism-live.mjs?load=javascript";
import "../../notebook/color-notebook.js";
import "./colors.js";
import { styleCallouts } from "./enhance.js";

if (location.pathname.indexOf("/docs/") > -1 && window.toc) {
	import("./docs.js");
}

let root = document.documentElement;

styleCallouts();

document.addEventListener("scroll", evt => {
	root.style.setProperty("--scrolltop", root.scrollTop);
}, {passive: true});
