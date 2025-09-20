import { Flamework } from "@flamework/core";
import ReactRoblox, { createPortal, createRoot } from "@rbxts/react-roblox";
import React from "@rbxts/react";
import App from "./ui/App";
import { Players } from "@rbxts/services";

const Player = Players.LocalPlayer;

function start() {
	// Initialize Flamework
	Flamework.addPaths("src/client");
	Flamework.ignite();

	const playerGui = Player.FindFirstChildOfClass("PlayerGui")!;
	const root = createRoot(new Instance("Folder"));

	const portal = createPortal(
		<screengui>
			<App />
		</screengui>,
		playerGui,
	);

	root.render(portal);
}

start();
