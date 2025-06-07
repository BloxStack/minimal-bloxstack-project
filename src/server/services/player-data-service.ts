import { Service, OnStart, OnInit } from "@flamework/core";
import { Players, DataStoreService } from "@rbxts/services";
import { console } from "@rbxts/jsnatives";

interface PlayerData {
	personalBest: number;
	totalPlays: number;
	lastPlayed: number;
	achievements: string[];
}

@Service({})
export class PlayerDataService implements OnStart, OnInit {
	private dataStore = DataStoreService.GetDataStore("TowerClimbData");
	private playerCache: Map<number, PlayerData> = new Map();
	private saveQueue: Set<number> = new Set();

	onInit() {
		console.log("PlayerDataService initializing...");
	}

	onStart() {
		console.log("PlayerDataService starting...");

		// Handle player connections
		Players.PlayerAdded.Connect((player) => this.loadPlayerData(player));
		Players.PlayerRemoving.Connect((player) => this.savePlayerData(player));

		// Auto-save every 60 seconds
		spawn(() => {
			while (game.GetService("RunService").IsRunning()) {
				wait(60);
				this.saveAllDirtyData();
			}
		});
	}

	private async loadPlayerData(player: Player): Promise<void> {
		try {
			const key = `player_${player.UserId}`;
			const [data] = await this.dataStore.GetAsync(key);
			const playerStoredData = data as PlayerData | undefined;

			const playerData: PlayerData = {
				personalBest: playerStoredData?.personalBest || 0,
				totalPlays: playerStoredData?.totalPlays || 0,
				lastPlayed: DateTime.now().UnixTimestamp,
				achievements: playerStoredData?.achievements || [],
			};

			this.playerCache.set(player.UserId, playerData);
			console.log(`Loaded data for ${player.Name}: PB = ${playerData.personalBest}`);
		} catch (error) {
			console.error(`Failed to load data for ${player.Name}:`, error);

			// Create default data on error
			const defaultData: PlayerData = {
				personalBest: 0,
				totalPlays: 0,
				lastPlayed: DateTime.now().UnixTimestamp,
				achievements: [],
			};
			this.playerCache.set(player.UserId, defaultData);
		}
	}

	private async savePlayerData(player: Player): Promise<void> {
		const data = this.playerCache.get(player.UserId);
		if (!data) return;

		try {
			const key = `player_${player.UserId}`;
			await this.dataStore.SetAsync(key, data);
			this.saveQueue.delete(player.UserId);
			console.log(`Saved data for ${player.Name}`);
		} catch (error) {
			console.error(`Failed to save data for ${player.Name}:`, error);
		}
	}

	private async saveAllDirtyData(): Promise<void> {
		const savePromises: Promise<void>[] = [];

		for (const userId of this.saveQueue) {
			const player = Players.GetPlayerByUserId(userId);
			if (player) {
				savePromises.push(this.savePlayerData(player));
			}
		}

		if (savePromises.size() > 0) {
			console.log(`Auto-saving ${savePromises.size()} player data records...`);
			await Promise.all(savePromises);
		}
	}

	// Public methods for routes
	public async getPersonalBest(player: Player): Promise<number> {
		const data = this.playerCache.get(player.UserId);
		return data?.personalBest || 0;
	}

	public async updatePersonalBest(player: Player, height: number): Promise<boolean> {
		const data = this.playerCache.get(player.UserId);
		if (!data) return false;

		if (height > data.personalBest) {
			data.personalBest = height;
			data.lastPlayed = DateTime.now().UnixTimestamp;
			this.saveQueue.add(player.UserId);

			console.log(`New personal best for ${player.Name}: ${height}`);
			return true;
		}

		return false;
	}

	public async incrementPlayCount(player: Player): Promise<void> {
		const data = this.playerCache.get(player.UserId);
		if (data) {
			data.totalPlays++;
			data.lastPlayed = DateTime.now().UnixTimestamp;
			this.saveQueue.add(player.UserId);
		}
	}

	public async getLeaderboard(): Promise<Array<{ name: string; height: number; isOnline: boolean }>> {
		const leaderboard: Array<{ name: string; height: number; isOnline: boolean }> = [];
		const onlinePlayers = new Set<number>();

		// Add online players
		for (const player of Players.GetPlayers()) {
			onlinePlayers.add(player.UserId);
			const data = this.playerCache.get(player.UserId);
			if (data && data.personalBest > 0) {
				leaderboard.push({
					name: player.DisplayName,
					height: data.personalBest,
					isOnline: true,
				});
			}
		}

		// Sort by height descending
		leaderboard.sort((a, b) => a.height > b.height);

		// Limit to top 10
		const top10: typeof leaderboard = [];
		for (let i = 0; i < math.min(10, leaderboard.size()); i++) {
			top10.push(leaderboard[i]);
		}
		return top10;
	}

	public getPlayerData(userId: number): PlayerData | undefined {
		return this.playerCache.get(userId);
	}

	public async addAchievement(player: Player, achievement: string): Promise<void> {
		const data = this.playerCache.get(player.UserId);
		if (data && !data.achievements.includes(achievement)) {
			data.achievements.push(achievement);
			this.saveQueue.add(player.UserId);
			console.log(`${player.Name} earned achievement: ${achievement}`);
		}
	}
}
