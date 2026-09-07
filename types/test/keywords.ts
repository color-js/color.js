import keywords from "colorjs.io/src/keywords";

// Used instead of $ExpectType due to the signature of keywords
keywords satisfies Record<string, [number, number, number]>;
