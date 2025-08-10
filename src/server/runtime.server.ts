import { Flamework } from "@flamework/core";

function start() {
	// Initialize Flamework
	Flamework.addPaths("src/server");
	Flamework.ignite();
}

start();
