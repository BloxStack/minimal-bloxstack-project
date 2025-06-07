import { Dependency } from "@flamework/core";
import { GameState, PlayerProgress, Checkpoint, TOWER_CONFIG } from "shared/types/tower";
import { TowerService } from "../services/tower-service";
import { PlayerDataService } from "../services/player-data-service";
import { console } from "@rbxts/jsnatives";

// Get service instances
const towerService = Dependency<TowerService>();
const playerDataService = Dependency<PlayerDataService>();

// Mock BloxStack patterns for now - will be replaced by actual BloxStack CLI
function usePlayer(): Player {
	// This will be replaced by actual player context in generated code
	return game.GetService("Players").LocalPlayer as Player;
}

function route<T>(routes: T): T {
	return routes;
}

function event<T>() {
	return {} as unknown;
}

export const towerRoutes = route({
	// Get current game state
	async getGameState(): Promise<GameState> {
		return towerService.getGameState();
	},

	// Update player's current height/progress
	async updatePlayerHeight(height: number): Promise<{ success: boolean; newBest?: boolean }> {
		const player = usePlayer();
		console.log(`Updating height for ${player.Name}: ${height}`);

		// Validate height (anti-cheat)
		const currentProgress = towerService.getPlayerProgress(player.UserId);
		if (currentProgress && height > currentProgress.currentHeight + 50) {
			console.warn(`Suspicious height update from ${player.Name}: ${height}`);
			return { success: false };
		}

		const result = await towerService.updatePlayerHeight(player, height);

		if (result.newBest) {
			await playerDataService.updatePersonalBest(player, height);
		}

		return result;
	},

	// Activate a checkpoint
	async activateCheckpoint(checkpointId: number): Promise<{ success: boolean }> {
		const player = usePlayer();
		console.log(`Checkpoint ${checkpointId} activated by ${player.Name}`);

		const success = await towerService.activateCheckpoint(player, checkpointId);
		return { success };
	},

	// Reset player to last checkpoint
	async resetToCheckpoint(): Promise<{ success: boolean; position?: Vector3 }> {
		const player = usePlayer();
		const checkpointPos = await towerService.resetPlayerToCheckpoint(player);

		return {
			success: checkpointPos !== undefined,
			position: checkpointPos,
		};
	},

	// Get player's personal best
	async getPersonalBest(): Promise<number> {
		const player = usePlayer();
		return await playerDataService.getPersonalBest(player);
	},

	// Get leaderboard data
	async getLeaderboard(): Promise<Array<{ name: string; height: number; isOnline: boolean }>> {
		return await playerDataService.getLeaderboard();
	},

	// Events for real-time updates
	onGameStateChanged: event<GameState>(),
	onPlayerProgressUpdated: event<{ userId: number; progress: PlayerProgress }>(),
	onTowerReset: event<{ newTowerId: string; resetTime: number }>(),
	onCheckpointActivated: event<{ playerId: number; playerName: string; checkpointId: number }>(),
	onPlayerFinished: event<{ playerId: number; playerName: string; time: number; newBest: boolean }>(),
	onNewPersonalBest: event<{ playerId: number; playerName: string; height: number }>(),
});
