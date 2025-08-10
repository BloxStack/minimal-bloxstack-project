import { Flamework } from "@flamework/core";


function start() {
	// Initialize Flamework
	Flamework.addPaths("src/client");
	Flamework.ignite();
}

start();
