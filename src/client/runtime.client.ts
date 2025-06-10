import { Flamework } from "@flamework/core";
import { console } from "@rbxts/jsnatives";

// Import controllers and UI
import "shared/generated/route-handlers";

function start() {
	// Initialize Flamework
	Flamework.addPaths("src/client");
	Flamework.ignite();
}

start();
