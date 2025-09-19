import { startBloxStackClient } from "@bloxstack/sdk";
import { SharedBloxstack } from "shared/bloxstack";

export const ClientBloxstack = startBloxStackClient(SharedBloxstack, {});
