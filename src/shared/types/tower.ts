export interface TowerSection {
	id: string;
	height: number;
	difficulty: "easy" | "medium" | "hard" | "extreme";
	parts: ObstacleConfig[];
	checkpointPosition?: Vector3;
}

export interface ObstacleConfig {
	obstacleType: "static" | "moving" | "rotating" | "disappearing" | "killbrick";
	position: Vector3;
	size: Vector3;
	color?: Color3;
	material?: Enum.Material;
	movePattern?: {
		startPos: Vector3;
		endPos: Vector3;
		duration: number;
		easing?: "linear" | "sine" | "bounce";
	};
	rotatePattern?: {
		rotationSpeed: number;
		axis: Vector3;
	};
	disappearPattern?: {
		visibleTime: number;
		hiddenTime: number;
		offset: number;
	};
}

export interface PlayerProgress {
	userId: number;
	displayName: string;
	currentHeight: number;
	lastCheckpoint: number;
	startTime: number;
	personalBest?: number;
	completedSections: string[];
}

export interface GameState {
	currentTowerId: string;
	towerStartTime: number;
	towerDuration: number; // in seconds
	timeRemaining: number;
	isActive: boolean;
	playerProgresses: Map<number, PlayerProgress>;
	totalHeight: number;
}

export interface Checkpoint {
	id: number;
	height: number;
	position: Vector3;
	color: Color3;
	activated: boolean;
}

export const TOWER_CONFIG = {
	SECTIONS_COUNT: 15,
	SECTION_HEIGHT: 25,
	RESET_INTERVAL: 300, // 5 minutes
	MAX_PLAYERS: 20,
	CHECKPOINT_INTERVAL: 3, // Every 3 sections
} as const;

export const DIFFICULTY_WEIGHTS = {
	easy: 0.4,
	medium: 0.3,
	hard: 0.2,
	extreme: 0.1,
} as const;

export const OBSTACLE_COLORS = {
	static: Color3.fromRGB(100, 100, 100),
	moving: Color3.fromRGB(255, 150, 0),
	rotating: Color3.fromRGB(0, 150, 255),
	disappearing: Color3.fromRGB(255, 100, 255),
	killbrick: Color3.fromRGB(255, 50, 50),
	checkpoint: Color3.fromRGB(50, 255, 50),
} as const;
