// Copy manually-written `.d.ts` files from `src/` to `types/src/`
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE = "../src/";
const DEST = "../types/src/";

/**
 * `.d.ts` files to copy.
 * Paths written relative to the `src/` directory
 */
const TO_COPY = [
	"color.d.ts",
	"ColorSpace.d.ts",
	"hooks.d.ts",
	"index.d.ts",
	"space-coord-accessors.d.ts",
	"types.d.ts",
];

/** Script file directory */
const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(resolve(__dirname, DEST), { recursive: true });
for (const file of TO_COPY) {
	copyFileSync(
		resolve(__dirname, SOURCE, file),
		resolve(__dirname, DEST, file),
	);
}
