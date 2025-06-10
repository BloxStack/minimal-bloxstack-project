import { Flamework } from "@flamework/core";

import "./generated/server-connections";

function start() {
	// Initialize Flamework
	Flamework.addPaths("src/server");
	Flamework.ignite();
}

start();
