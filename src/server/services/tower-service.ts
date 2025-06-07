import { Service, OnStart, OnInit } from "@flamework/core";
import { Players, RunService, Workspace, HttpService } from "@rbxts/services";
import {
	TowerSection,
	ObstacleConfig,
	GameState,
	PlayerProgress,
	Checkpoint,
	TOWER_CONFIG,
	DIFFICULTY_WEIGHTS,
	OBSTACLE_COLORS,
} from "shared/types/tower";
import { console, Object, setTimeout, setInterval } from "@rbxts/jsnatives";

@Service({})
export class TowerService implements OnStart, OnInit {
	private gameState: GameState;
	private currentTower?: Model;
	private checkpoints: Map<number, Checkpoint> = new Map();
	private resetTimer?: RBXScriptConnection;
	private updateTimer?: RBXScriptConnection;

	constructor() {
		this.gameState = {
			currentTowerId: HttpService.GenerateGUID(false),
			towerStartTime: DateTime.now().UnixTimestamp,
			towerDuration: TOWER_CONFIG.RESET_INTERVAL,
			timeRemaining: TOWER_CONFIG.RESET_INTERVAL,
			isActive: true,
			playerProgresses: new Map(),
			totalHeight: TOWER_CONFIG.SECTIONS_COUNT * TOWER_CONFIG.SECTION_HEIGHT,
		};
	}

	onInit() {
		console.log("TowerService initializing...");
	}

	onStart() {
		console.log("TowerService starting...");
		this.generateNewTower();
		this.startResetTimer();
		this.startUpdateTimer();

		// Handle player connections
		Players.PlayerAdded.Connect((player) => this.onPlayerJoined(player));
		Players.PlayerRemoving.Connect((player) => this.onPlayerLeaving(player));
	}

	private generateNewTower(): void {
		console.log("Generating new tower...");

		// Clear existing tower
		if (this.currentTower) {
			this.currentTower.Destroy();
		}

		// Create new tower
		this.currentTower = new Instance("Model");
		this.currentTower.Name = "Tower";
		this.currentTower.Parent = Workspace;

		// Generate tower sections
		let currentHeight = 0;
		const sections: TowerSection[] = [];

		for (let i = 0; i < TOWER_CONFIG.SECTIONS_COUNT; i++) {
			const difficulty = this.selectRandomDifficulty();
			const section = this.generateTowerSection(tostring(i), currentHeight, difficulty);
			sections.push(section);

			// Build the physical section
			this.buildTowerSection(section);

			// Add checkpoint every few sections
			if (i % TOWER_CONFIG.CHECKPOINT_INTERVAL === 0) {
				this.createCheckpoint(i, currentHeight + 10, new Vector3(0, currentHeight + 10, 0));
			}

			currentHeight += TOWER_CONFIG.SECTION_HEIGHT;
		}

		// Create finish platform
		this.createFinishPlatform(currentHeight);

		console.log(`Tower generated with ${sections.size()} sections, height: ${currentHeight}`);
	}

	private selectRandomDifficulty(): "easy" | "medium" | "hard" | "extreme" {
		const rand = math.random();
		let cumulative = 0;

		for (const [difficulty, weight] of Object.entries(DIFFICULTY_WEIGHTS)) {
			cumulative += weight;
			if (rand <= cumulative) {
				return difficulty as "easy" | "medium" | "hard" | "extreme";
			}
		}
		return "easy";
	}

	private generateTowerSection(
		id: string,
		baseHeight: number,
		difficulty: "easy" | "medium" | "hard" | "extreme",
	): TowerSection {
		const obstacles: ObstacleConfig[] = [];
		const obstacleCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : difficulty === "hard" ? 7 : 10;

		for (let i = 0; i < obstacleCount; i++) {
			const obstacleType = this.selectObstacleType(difficulty);
			const obstacle: ObstacleConfig = {
				obstacleType,
				position: new Vector3(
					math.random() * 40 - 20,
					baseHeight + math.random() * TOWER_CONFIG.SECTION_HEIGHT,
					math.random() * 40 - 20,
				),
				size: new Vector3(math.random() * 8 + 2, math.random() * 2 + 1, math.random() * 8 + 2),
				color: OBSTACLE_COLORS[obstacleType],
				material: Enum.Material.Neon,
			};

			// Add special patterns based on obstacle type
			if (obstacleType === "moving") {
				obstacle.movePattern = {
					startPos: obstacle.position,
					endPos: obstacle.position.add(new Vector3(math.random() * 20 - 10, 0, math.random() * 20 - 10)),
					duration: math.random() * 3 + 2,
					easing: "sine",
				};
			} else if (obstacleType === "rotating") {
				obstacle.rotatePattern = {
					rotationSpeed: math.random() * 180 + 90,
					axis: new Vector3(0, 1, 0),
				};
			} else if (obstacleType === "disappearing") {
				obstacle.disappearPattern = {
					visibleTime: math.random() * 2 + 1,
					hiddenTime: math.random() * 2 + 1,
					offset: math.random() * 2,
				};
			}

			obstacles.push(obstacle);
		}

		return {
			id,
			height: baseHeight,
			difficulty,
			parts: obstacles,
		};
	}

	private selectObstacleType(difficulty: "easy" | "medium" | "hard" | "extreme"): ObstacleConfig["obstacleType"] {
		const types: ObstacleConfig["obstacleType"][] = ["static"];

		if (difficulty !== "easy") types.push("moving");
		if (difficulty === "hard" || difficulty === "extreme") types.push("rotating", "disappearing");
		if (difficulty === "extreme") types.push("killbrick");

		return types[math.floor(math.random() * types.size())];
	}

	private buildTowerSection(section: TowerSection): void {
		for (const obstacle of section.parts) {
			const part = new Instance("Part");
			part.Name = `${obstacle.obstacleType}_${section.id}`;
			part.Size = obstacle.size;
			part.Position = obstacle.position;
			part.Color = obstacle.color || OBSTACLE_COLORS.static;
			part.Material = obstacle.material || Enum.Material.Plastic;
			part.Anchored = true;
			part.Parent = this.currentTower;

			// Add special behaviors
			if (obstacle.obstacleType === "killbrick") {
				part.Touched.Connect((hit) => {
					const humanoid = hit.Parent?.FindFirstChild("Humanoid") as Humanoid;
					if (humanoid) {
						humanoid.Health = 0;
					}
				});
			}

			// Add movement/rotation patterns
			if (obstacle.movePattern) {
				this.addMovementPattern(part, obstacle.movePattern);
			}
			if (obstacle.rotatePattern) {
				this.addRotationPattern(part, obstacle.rotatePattern);
			}
			if (obstacle.disappearPattern) {
				this.addDisappearPattern(part, obstacle.disappearPattern);
			}
		}
	}

	private addMovementPattern(part: Part, pattern: NonNullable<ObstacleConfig["movePattern"]>): void {
		const TweenService = game.GetService("TweenService");
		const tweenInfo = new TweenInfo(pattern.duration, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true);
		const tween = TweenService.Create(part, tweenInfo, { Position: pattern.endPos });
		tween.Play();
	}

	private addRotationPattern(part: Part, pattern: NonNullable<ObstacleConfig["rotatePattern"]>): void {
		const connection = RunService.Heartbeat.Connect((deltaTime) => {
			part.CFrame = part.CFrame.mul(CFrame.Angles(0, math.rad(pattern.rotationSpeed * deltaTime), 0));
		});
	}

	private addDisappearPattern(part: Part, pattern: NonNullable<ObstacleConfig["disappearPattern"]>): void {
		setTimeout(() => {
			const cycleTime = pattern.visibleTime + pattern.hiddenTime;
			setInterval(() => {
				part.Transparency = part.Transparency === 0 ? 1 : 0;
				part.CanCollide = part.Transparency === 0;
			}, cycleTime * 1000);
		}, pattern.offset * 1000);
	}

	private createCheckpoint(id: number, height: number, position: Vector3): void {
		const checkpoint: Checkpoint = {
			id,
			height,
			position,
			color: OBSTACLE_COLORS.checkpoint,
			activated: false,
		};

		this.checkpoints.set(id, checkpoint);

		// Create physical checkpoint
		const part = new Instance("Part");
		part.Name = `Checkpoint_${id}`;
		part.Size = new Vector3(8, 2, 8);
		part.Position = position;
		part.Color = checkpoint.color;
		part.Material = Enum.Material.ForceField;
		part.Anchored = true;
		part.Shape = Enum.PartType.Cylinder;
		part.Parent = this.currentTower;

		// Add touch detection
		part.Touched.Connect((hit) => {
			const player = Players.GetPlayerFromCharacter(hit.Parent);
			if (player) {
				this.activateCheckpoint(player, id);
			}
		});
	}

	private createFinishPlatform(height: number): void {
		const platform = new Instance("Part");
		platform.Name = "FinishPlatform";
		platform.Size = new Vector3(20, 4, 20);
		platform.Position = new Vector3(0, height + 2, 0);
		platform.Color = Color3.fromRGB(255, 215, 0); // Gold
		platform.Material = Enum.Material.Neon;
		platform.Anchored = true;
		platform.Parent = this.currentTower;

		platform.Touched.Connect((hit) => {
			const player = Players.GetPlayerFromCharacter(hit.Parent);
			if (player) {
				this.onPlayerFinished(player);
			}
		});
	}

	private startResetTimer(): void {
		this.resetTimer = RunService.Heartbeat.Connect(() => {
			this.gameState.timeRemaining = math.max(
				0,
				this.gameState.towerDuration - (DateTime.now().UnixTimestamp - this.gameState.towerStartTime),
			);

			if (this.gameState.timeRemaining <= 0) {
				this.resetTower();
			}
		});
	}

	private startUpdateTimer(): void {
		// Update player heights every second
		this.updateTimer = RunService.Heartbeat.Connect(() => {
			for (const [userId, _] of this.gameState.playerProgresses) {
				const player = Players.GetPlayerByUserId(userId);
				if (!player) continue;

				const humanoidRootPart = player.Character?.FindFirstChild("HumanoidRootPart") as Part;
				if (humanoidRootPart) {
					const currentHeight = humanoidRootPart.Position.Y;

					const progress = this.gameState.playerProgresses.get(userId);
					if (progress && currentHeight > progress.currentHeight) {
						this.updatePlayerHeight(player, currentHeight);
					}
				}
			}
		});
	}

	private resetTower(): void {
		console.log("Resetting tower...");

		this.gameState = {
			currentTowerId: HttpService.GenerateGUID(false),
			towerStartTime: DateTime.now().UnixTimestamp,
			towerDuration: TOWER_CONFIG.RESET_INTERVAL,
			timeRemaining: TOWER_CONFIG.RESET_INTERVAL,
			isActive: true,
			playerProgresses: new Map(),
			totalHeight: TOWER_CONFIG.SECTIONS_COUNT * TOWER_CONFIG.SECTION_HEIGHT,
		};

		this.checkpoints.clear();
		this.generateNewTower();

		// Reset all players to spawn
		for (const player of Players.GetPlayers()) {
			this.onPlayerJoined(player);
		}
	}

	private onPlayerJoined(player: Player): void {
		const progress: PlayerProgress = {
			userId: player.UserId,
			displayName: player.DisplayName,
			currentHeight: 0,
			lastCheckpoint: -1,
			startTime: DateTime.now().UnixTimestamp,
			completedSections: [],
		};

		this.gameState.playerProgresses.set(player.UserId, progress);
		console.log(`${player.Name} joined the tower climb`);
	}

	private onPlayerLeaving(player: Player): void {
		this.gameState.playerProgresses.delete(player.UserId);
		console.log(`${player.Name} left the tower climb`);
	}

	private onPlayerFinished(player: Player): void {
		const progress = this.gameState.playerProgresses.get(player.UserId);
		if (progress) {
			const completionTime = DateTime.now().UnixTimestamp - progress.startTime;
			console.log(`${player.Name} finished the tower in ${completionTime} seconds!`);
		}
	}

	// Public methods for routes
	public getGameState(): GameState {
		return this.gameState;
	}

	public getPlayerProgress(userId: number): PlayerProgress | undefined {
		return this.gameState.playerProgresses.get(userId);
	}

	public async updatePlayerHeight(player: Player, height: number): Promise<{ success: boolean; newBest?: boolean }> {
		const progress = this.gameState.playerProgresses.get(player.UserId);
		if (!progress) return { success: false };

		const oldHeight = progress.currentHeight;
		progress.currentHeight = math.max(oldHeight, height);

		return { success: true };
	}

	public async activateCheckpoint(player: Player, checkpointId: number): Promise<boolean> {
		const progress = this.gameState.playerProgresses.get(player.UserId);
		const checkpoint = this.checkpoints.get(checkpointId);

		if (!progress || !checkpoint) return false;

		if (checkpointId > progress.lastCheckpoint) {
			progress.lastCheckpoint = checkpointId;
			checkpoint.activated = true;
			console.log(`${player.Name} activated checkpoint ${checkpointId}`);
			return true;
		}

		return false;
	}

	public async resetPlayerToCheckpoint(player: Player): Promise<Vector3 | undefined> {
		const progress = this.gameState.playerProgresses.get(player.UserId);
		if (!progress || progress.lastCheckpoint < 0) return;

		const checkpoint = this.checkpoints.get(progress.lastCheckpoint);
		return checkpoint?.position;
	}
}
