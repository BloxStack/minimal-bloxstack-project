import { audioAdapter, createBloxStack, flameworkAdapter } from "@bloxstack/sdk";

/** In shared */
const soundEffects = {
	OOF: 1,
};

export const SharedBloxstack = createBloxStack({
	debugMode: true,
	adapters: [
		audioAdapter({
			SoundEffects: soundEffects,
		}),
		flameworkAdapter({
			ClientPath: "src/client/controllers",
			ServerPath: "src/server/services",
		}),
	] as const,
});
