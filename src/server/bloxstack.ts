import { startBloxStackServer } from "@bloxstack/sdk";
import { SharedBloxstack } from "shared/bloxstack";

export const ServerBloxstack = startBloxStackServer(SharedBloxstack, {
	serverOnlyOption: true,
});
