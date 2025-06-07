import { Controller, OnStart, OnInit } from "@flamework/core";
import { Players, RunService } from "@rbxts/services";
import { createRoot, Root } from "@rbxts/react-roblox";
import React from "@rbxts/react";
import { setTimeout } from "@rbxts/jsnatives";
import { App } from "../ui/app";
import { gameActions } from "../ui/atoms";

@Controller({})
export class UIController implements OnStart, OnInit {
	private root?: Root;

	onInit() {
		print("UIController initializing...");
	}

	onStart() {
		print("UIController starting...");
		this.initializeUI();
		this.connectDataSources();
	}

	private initializeUI(): void {
		const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui");

		// Create React root
		const target = new Instance("Folder");
		target.Name = "TowerClimbUI";
		target.Parent = playerGui;

		this.root = createRoot(target);
		this.root.render(React.createElement(App));

		print("Tower Climb UI initialized");
	}

	private connectDataSources(): void {
		// Mock data for now - this would be connected to actual server communication

		// Start with some example notifications
		setTimeout(() => {
			gameActions.showNotification("Welcome to Tower of Hell!", "info", 5);
		}, 2000);

		setTimeout(() => {
			gameActions.showNotification("Race to climb the tower!", "success", 4);
		}, 4000);

		// Mock height tracking (would be replaced with actual player position tracking)
		let mockHeight = 0;
		let mockPB = 150;

		gameActions.updatePersonalBest(mockPB);

		const heightTracker = RunService.Heartbeat.Connect(() => {
			const player = Players.LocalPlayer;
			const humanoidRootPart = player.Character?.FindFirstChild("HumanoidRootPart") as Part;
			if (humanoidRootPart) {
				const currentHeight = math.max(0, humanoidRootPart.Position.Y);

				if (currentHeight !== mockHeight) {
					mockHeight = currentHeight;
					gameActions.updateLocalPlayerProgress({
						userId: player.UserId,
						displayName: player.DisplayName,
						currentHeight: currentHeight,
						lastCheckpoint: math.floor(currentHeight / 75), // Every 75 studs
						startTime: DateTime.now().UnixTimestamp,
						completedSections: [],
					});

					// Check for new personal best
					if (currentHeight > mockPB) {
						mockPB = currentHeight;
						gameActions.updatePersonalBest(mockPB);
						gameActions.showNotification(`New Personal Best: ${math.floor(mockPB)}m!`, "success", 3);
					}
				}
			}
		});

		// Mock game state updates
		const gameStateUpdater = RunService.Heartbeat.Connect(() => {
			const timeRemaining = 300 - (DateTime.now().UnixTimestamp % 300); // 5-minute cycle
			gameActions.updateGameState({
				currentTowerId: "tower_001",
				towerStartTime: DateTime.now().UnixTimestamp - (300 - timeRemaining),
				towerDuration: 300,
				timeRemaining: timeRemaining,
				isActive: true,
				playerProgresses: new Map([
					[
						Players.LocalPlayer.UserId,
						{
							userId: Players.LocalPlayer.UserId,
							displayName: Players.LocalPlayer.DisplayName,
							currentHeight: mockHeight,
							lastCheckpoint: math.floor(mockHeight / 75),
							startTime: DateTime.now().UnixTimestamp - 120,
							completedSections: [],
						},
					],
				]),
				totalHeight: 375, // 15 sections * 25 height each
			});
		});

		// Mock leaderboard data
		setTimeout(() => {
			gameActions.updateLeaderboard([
				{ name: "ProClimber123", height: 342, isOnline: false },
				{ name: "TowerMaster", height: 298, isOnline: false },
				{ name: "SpeedRunner99", height: 276, isOnline: true },
				{ name: "JumpKing", height: 254, isOnline: false },
				{ name: Players.LocalPlayer.DisplayName, height: mockHeight, isOnline: true },
			]);
		}, 3000);

		// Checkpoint simulation
		let lastCheckpointHeight = 0;
		const checkpointChecker = RunService.Heartbeat.Connect(() => {
			const checkpointHeight = math.floor(mockHeight / 75) * 75;
			if (checkpointHeight > lastCheckpointHeight && checkpointHeight > 0) {
				lastCheckpointHeight = checkpointHeight;
				gameActions.showNotification(`Checkpoint ${math.floor(checkpointHeight / 75)} reached!`, "success", 2);
			}
		});

		// Tower reset warning
		const warningChecker = RunService.Heartbeat.Connect(() => {
			const timeRemaining = 300 - (DateTime.now().UnixTimestamp % 300);
			if (timeRemaining <= 30 && timeRemaining > 29) {
				gameActions.showNotification("Tower resetting in 30 seconds!", "warning", 5);
			}
			if (timeRemaining <= 10 && timeRemaining > 9) {
				gameActions.showNotification("Tower resetting in 10 seconds!", "error", 3);
			}
			if (timeRemaining <= 1 && timeRemaining > 0) {
				gameActions.showNotification("Tower reset! New tower generated!", "info", 4);
			}
		});
	}
}
