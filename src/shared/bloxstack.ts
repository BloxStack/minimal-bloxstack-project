import { audioAdapter, createBloxStack } from "@bloxstack/sdk";

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
	] as const,
});
