const extensions = {
	"apiLinks": { // TODO read api/api.json to see what to linkify
		type: "lang",
		regex: /`([Cc]olor).(\w+)\(\)`/g,
		replace: ($0, className, funcName) => {
			return `<a href="@@webRoot/api/#Color${className === "Color" ? "." : "#"}${funcName}">${$0}</a>`;
		},
	},
	"callouts": {
		type: "lang",
		regex: /^\s*(Tip|Warning|Note):\s+/gm,
		replace: ($0, className, funcName) => {
			return `<p class="${className.toLowerCase()}" markdown="1">`;
		},
	},
};

export default extensions;
