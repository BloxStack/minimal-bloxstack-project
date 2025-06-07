import { Service, OnStart, OnInit } from "@flamework/core";
import { Players, Workspace } from "@rbxts/services";
import { console } from "@rbxts/jsnatives";

@Service({})
export class SpawnService implements OnStart, OnInit {
	private spawnLocation?: SpawnLocation;

	onInit() {
		console.log("SpawnService initializing...");
	}

	onStart() {
		console.log("SpawnService starting...");
		this.createSpawnArea();
		this.setupPlayerSpawning();
	}

	private createSpawnArea(): void {
		// Create spawn platform
		const spawnPlatform = new Instance("Part");
		spawnPlatform.Name = "SpawnPlatform";
		spawnPlatform.Size = new Vector3(40, 4, 40);
		spawnPlatform.Position = new Vector3(0, 2, 0);
		spawnPlatform.Material = Enum.Material.Neon;
		spawnPlatform.Color = Color3.fromRGB(100, 200, 100);
		spawnPlatform.Anchored = true;
		spawnPlatform.Parent = Workspace;

		// Create spawn location
		this.spawnLocation = new Instance("SpawnLocation");
		this.spawnLocation.Name = "TowerSpawn";
		this.spawnLocation.Size = new Vector3(8, 1.2, 8);
		this.spawnLocation.Position = new Vector3(0, 6, 0);
		this.spawnLocation.Material = Enum.Material.ForceField;
		this.spawnLocation.Color = Color3.fromRGB(50, 255, 50);
		this.spawnLocation.Anchored = true;
		this.spawnLocation.CanCollide = false;
		this.spawnLocation.Transparency = 0.3;
		this.spawnLocation.Parent = Workspace;

		// Add spawn platform decorations
		const welcomeSign = new Instance("Part");
		welcomeSign.Name = "WelcomeSign";
		welcomeSign.Size = new Vector3(20, 8, 1);
		welcomeSign.Position = new Vector3(0, 10, -25);
		welcomeSign.Material = Enum.Material.Neon;
		welcomeSign.Color = Color3.fromRGB(255, 100, 100);
		welcomeSign.Anchored = true;
		welcomeSign.Parent = Workspace;

		// Add text to welcome sign
		const surfaceGui = new Instance("SurfaceGui");
		surfaceGui.Face = Enum.NormalId.Front;
		surfaceGui.Parent = welcomeSign;

		const titleLabel = new Instance("TextLabel");
		titleLabel.Size = UDim2.fromScale(1, 0.5);
		titleLabel.Position = UDim2.fromScale(0, 0.1);
		titleLabel.Text = "🏗️ TOWER OF HELL";
		titleLabel.TextColor3 = Color3.fromRGB(255, 255, 255);
		titleLabel.TextScaled = true;
		titleLabel.Font = Enum.Font.GothamBold;
		titleLabel.BackgroundTransparency = 1;
		titleLabel.Parent = surfaceGui;

		const subtitleLabel = new Instance("TextLabel");
		subtitleLabel.Size = UDim2.fromScale(1, 0.3);
		subtitleLabel.Position = UDim2.fromScale(0, 0.65);
		subtitleLabel.Text = "Race to climb the procedural tower!";
		subtitleLabel.TextColor3 = Color3.fromRGB(200, 200, 200);
		subtitleLabel.TextScaled = true;
		subtitleLabel.Font = Enum.Font.Gotham;
		subtitleLabel.BackgroundTransparency = 1;
		subtitleLabel.Parent = surfaceGui;

		console.log("Spawn area created successfully");
	}

	private setupPlayerSpawning(): void {
		Players.PlayerAdded.Connect((player) => {
			player.CharacterAdded.Connect((character) => {
				this.onPlayerSpawned(player, character);
			});

			if (player.Character) {
				this.onPlayerSpawned(player, player.Character);
			}
		});

		// Handle existing players
		for (const player of Players.GetPlayers()) {
			if (player.Character) {
				this.onPlayerSpawned(player, player.Character);
			}
		}
	}

	private onPlayerSpawned(player: Player, character: Model): void {
		// Wait for humanoid root part
		const humanoidRootPart = character.WaitForChild("HumanoidRootPart") as Part;
		
		// Teleport player to spawn
		if (this.spawnLocation) {
			humanoidRootPart.CFrame = this.spawnLocation.CFrame.add(new Vector3(0, 5, 0));
		}

		// Give player some basic properties
		const humanoid = character.FindFirstChild("Humanoid") as Humanoid;
		if (humanoid) {
			humanoid.WalkSpeed = 16;
			humanoid.JumpPower = 50;
		}

		console.log(`${player.Name} spawned at tower base`);

		// Add respawn on death
		humanoid?.Died.Connect(() => {
			wait(3); // Wait for respawn
			if (player.Character) {
				const newHumanoidRootPart = player.Character.FindFirstChild("HumanoidRootPart") as Part;
				if (newHumanoidRootPart && this.spawnLocation) {
					newHumanoidRootPart.CFrame = this.spawnLocation.CFrame.add(new Vector3(0, 5, 0));
				}
			}
		});
	}

	public getSpawnLocation(): Vector3 {
		return this.spawnLocation ? this.spawnLocation.Position : new Vector3(0, 10, 0);
	}
} 