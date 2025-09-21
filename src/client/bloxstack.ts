import { bloxStackClient } from "@bloxstack/sdk";
import { SharedBloxstack } from "shared/bloxstack";

export const ClientBloxstack = bloxStackClient(SharedBloxstack, {});
