import { Flamework } from "@flamework/core";

// Import services and routes
import "./services/tower-service";
import "./services/player-data-service";
import "./services/spawn-service";
import "./routes/tower";

// Initialize Flamework
Flamework.addPaths("src/server");
Flamework.ignite();

import "./generated/server-connections";
