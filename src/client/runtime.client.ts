import { Flamework } from "@flamework/core";

// Import controllers and UI
import "shared/generated/route-handlers";

// Initialize Flamework
Flamework.addPaths("src/client");
Flamework.ignite();
