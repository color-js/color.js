let $ = Bliss;
let code = $("#bundle > code");
code?.classList.remove("language-none");

document.addEventListener("mv-change", evt => {
	if (code.children === 0) {
		Prism.highlightElement(code);
	}
});

$("a[download]")?.addEventListener("click", evt => {
	evt.target.href = createURL(code.textContent);
});

function createURL(code, type = "text/javascript") {
	var blob = new Blob([code], {type});

	return URL.createObjectURL(blob);
}

// import {rollup} from "https://unpkg.com/rollup@2.10.9/dist/es/rollup.browser.js?module";
//
// async function build() {
//   // create a bundle
//   const bundle = await rollup({
// 	  input: "../src/index.js",
// 	  plugins: []
//   });
//
//   console.log(bundle.watchFiles); // an array of file names this bundle depends on
//
//   // generate output specific code in-memory
//   // you can call this function multiple times on the same bundle object
//   const { output } = await bundle.generate({
// 	  file: `dist/color.js`,
// 	  name: "Color",
// 	  format: "iife",
// 	  sourcemap: true,
// 	  exports: "named", /** Disable warning for default imports */
// 	  // plugins: [
// 		//   minify? terser({
// 		// 	  compress: true,
// 		// 	  mangle: true
// 		//   }) : undefined
// 	  // ]
//   });
//
//   for (const chunkOrAsset of output) {
//     if (chunkOrAsset.type === 'asset') {
//       // For assets, this contains
//       // {
//       //   fileName: string,              // the asset file name
//       //   source: string | Uint8Array    // the asset source
//       //   type: 'asset'                  // signifies that this is an asset
//       // }
//       console.log('Asset', chunkOrAsset);
//     } else {
//       // For chunks, this contains
//       // {
//       //   code: string,                  // the generated JS code
//       //   dynamicImports: string[],      // external modules imported dynamically by the chunk
//       //   exports: string[],             // exported variable names
//       //   facadeModuleId: string | null, // the id of a module that this chunk corresponds to
//       //   fileName: string,              // the chunk file name
//       //   imports: string[],             // external modules imported statically by the chunk
//       //   isDynamicEntry: boolean,       // is this chunk a dynamic entry point
//       //   isEntry: boolean,              // is this chunk a static entry point
//       //   map: string | null,            // sourcemaps if present
//       //   modules: {                     // information about the modules in this chunk
//       //     [id: string]: {
//       //       renderedExports: string[]; // exported variable names that were included
//       //       removedExports: string[];  // exported variable names that were removed
//       //       renderedLength: number;    // the length of the remaining code in this module
//       //       originalLength: number;    // the original length of the code in this module
//       //     };
//       //   },
//       //   name: string                   // the name of this chunk as used in naming patterns
//       //   type: 'chunk',                 // signifies that this is a chunk
//       // }
//       console.log('Chunk', chunkOrAsset.modules);
//     }
//   }
//
//   // or write the bundle to disk
//   // await bundle.write(outputOptions);
// }
//
// build();
