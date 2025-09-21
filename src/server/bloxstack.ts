import { bloxStackServer } from "@bloxstack/sdk";
import { SharedBloxstack } from "shared/bloxstack";

export const ServerBloxstack = bloxStackServer(SharedBloxstack, {
	serverOnlyOption: true,
});
