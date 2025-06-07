import { atom } from "@rbxts/charm";
import { setTimeout } from "@rbxts/jsnatives";
import { GameState, PlayerProgress } from "shared/types/tower";

// Game state atoms
export const gameStateAtom = atom<GameState | undefined>(undefined);
export const playerProgressesAtom = atom<Map<number, PlayerProgress>>(new Map());
export const timeRemainingAtom = atom<number>(0);
export const towerHeightAtom = atom<number>(0);

// Player-specific atoms
export const localPlayerProgressAtom = atom<PlayerProgress | undefined>(undefined);
export const personalBestAtom = atom<number>(0);
export const currentHeightAtom = atom<number>(0);
export const lastCheckpointAtom = atom<number>(-1);

// UI state atoms
export const showLeaderboardAtom = atom<boolean>(true);
export const showTimerAtom = atom<boolean>(true);
export const showPersonalStatsAtom = atom<boolean>(true);
export const leaderboardDataAtom = atom<Array<{ name: string; height: number; isOnline: boolean }>>([]);

// Notification atoms
export const notificationTextAtom = atom<string>("");
export const notificationTypeAtom = atom<"success" | "warning" | "error" | "info">("info");
export const showNotificationAtom = atom<boolean>(false);

// Actions
export const gameActions = {
	updateGameState(state: GameState) {
		gameStateAtom(state);
		playerProgressesAtom(state.playerProgresses);
		timeRemainingAtom(state.timeRemaining);
		towerHeightAtom(state.totalHeight);
	},

	updateLocalPlayerProgress(progress: PlayerProgress) {
		localPlayerProgressAtom(progress);
		currentHeightAtom(progress.currentHeight);
		lastCheckpointAtom(progress.lastCheckpoint);
	},

	updatePersonalBest(height: number) {
		personalBestAtom(height);
	},

	updateLeaderboard(data: Array<{ name: string; height: number; isOnline: boolean }>) {
		leaderboardDataAtom(data);
	},

	showNotification(text: string, _type: "success" | "warning" | "error" | "info" = "info", duration: number = 3) {
		notificationTextAtom(text);
		notificationTypeAtom(_type);
		showNotificationAtom(true);

		// Auto-hide after duration
		setTimeout(() => {
			showNotificationAtom(false);
		}, duration * 1000);
	},

	toggleLeaderboard() {
		showLeaderboardAtom(!showLeaderboardAtom());
	},

	toggleTimer() {
		showTimerAtom(!showTimerAtom());
	},

	togglePersonalStats() {
		showPersonalStatsAtom(!showPersonalStatsAtom());
	},
};
