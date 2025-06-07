# BloxStack Developer Guide

BloxStack is a modern development framework for Roblox that simplifies game development with LLM-friendly syntax and automatic networking code generation.

## Table of Contents

1. [Getting Started](#getting-started)
2. [SDK Reference](#sdk-reference)
3. [Routes System](#routes-system)
4. [State Management](#state-management)
5. [CLI Commands](#cli-commands)
6. [Development Server](#development-server)
7. [Code Generation](#code-generation)
8. [Best Practices](#best-practices)

## Getting Started

### Installation

```bash
npm install @bloxstack/sdk
npm install -g @bloxstack/cli
```

### Project Structure

```
my-game/
├── src/
│   ├── client/
│   │   └── routes/           # Client-side route definitions
│   ├── server/
│   │   └── routes/           # Server-side route definitions
│   └── shared/
│       └── generated/        # Auto-generated networking code
├── assets/                   # Game assets
├── bloxstack.config.ts       # BloxStack configuration
├── default.project.json      # Rojo configuration
└── tsconfig.json            # TypeScript configuration
```

## SDK Reference

### Core Imports

```typescript
import { route, event, state, usePlayer, useIsServer, useIsClient } from "@bloxstack/sdk";
```

### Context Hooks

#### `usePlayer()`

Gets the current player in a route context.

```typescript
export const shopRoute = route({
	async buyItem(itemId: string) {
		const player = usePlayer(); // Gets the player who called this route
		return await ShopService.purchase(player, itemId);
	},
});
```

#### `useIsServer()` / `useIsClient()`

Type-safe environment checks.

```typescript
const isServer = useIsServer(); // boolean
const isClient = useIsClient(); // boolean
```

### Utility Functions

#### `runOnServer()` / `runOnClient()`

Execute code only in specific environments.

```typescript
import { runOnServer, runOnClient } from "@bloxstack/sdk";

runOnServer(() => {
	// Server-only code
	console.log("Running on server");
});

runOnClient(() => {
	// Client-only code
	console.log("Running on client");
});
```

#### `runByEnvironment()`

Execute different code based on environment.

```typescript
import { runByEnvironment } from "@bloxstack/sdk";

runByEnvironment({
	server: () => console.log("Server code"),
	client: () => console.log("Client code"),
});
```

#### `delay()` / `nextFrame()`

Roblox-compatible async utilities.

```typescript
import { delay, nextFrame } from "@bloxstack/sdk";

await delay(2); // Wait 2 seconds
await nextFrame(); // Wait until next frame
```

## Routes System

Routes are the core of BloxStack's networking system. They automatically generate type-safe client-server communication.

### Server Routes

Server routes contain the actual game logic and run on the server.

```typescript
// src/server/routes/shop.ts
import { route, event, usePlayer } from "@bloxstack/sdk";

export const shopRoute = route({
	// Server functions that clients can call
	async buyItem(itemId: string, quantity: number = 1) {
		const player = usePlayer();

		// Server-side validation and logic
		const playerData = await PlayerDataService.get(player);
		const item = ShopConfig.items[itemId];

		if (!item) {
			throw new Error("Item not found");
		}

		const totalCost = item.price * quantity;
		if (playerData.money < totalCost) {
			throw new Error("Insufficient funds");
		}

		// Process purchase
		playerData.money -= totalCost;
		playerData.inventory.push(...Array(quantity).fill(itemId));

		await PlayerDataService.save(player, playerData);

		// Broadcast event to all clients
		this.onItemPurchased({
			playerName: player.Name,
			itemId,
			quantity,
			newBalance: playerData.money,
		});

		return {
			success: true,
			newBalance: playerData.money,
			itemsOwned: playerData.inventory,
		};
	},

	async getShopItems() {
		return Object.values(ShopConfig.items);
	},

	// Server events (broadcast to clients)
	onItemPurchased: event<{
		playerName: string;
		itemId: string;
		quantity: number;
		newBalance: number;
	}>(),
});
```

### Client Routes

Client routes define how the client calls server functions and handles events.

```typescript
// src/client/routes/shop.ts
import { route } from "@bloxstack/sdk";

export const shopClientRoute = route({
	// Client methods that call corresponding server routes
	async buyItem(itemId: string, quantity: number = 1) {
		// This automatically calls the server's shopRoute.buyItem()
		// with type safety and error handling
		return await this.callServer("shop.buyItem", itemId, quantity);
	},

	async getShopItems() {
		return await this.callServer("shop.getShopItems");
	},

	// Handle server events
	onItemPurchased: event<{
		playerName: string;
		itemId: string;
		quantity: number;
		newBalance: number;
	}>(),
});
```

### Route Parameters

Routes support various parameter types:

```typescript
export const exampleRoute = route({
	// Simple parameters
	async simpleMethod(name: string, age: number) {
		return `${name} is ${age} years old`;
	},

	// Optional parameters with defaults
	async withDefaults(message: string, count: number = 1) {
		return message.repeat(count);
	},

	// Object destructuring
	async withDestructuring({ name, age }: { name: string; age: number }) {
		return `${name} is ${age} years old`;
	},

	// Complex types
	async complexTypes(player: Player, items: { id: string; quantity: number }[], options?: { validate?: boolean }) {
		// Implementation
	},
});
```

## State Management

BloxStack includes a built-in state management system using Charm.

### Basic State

```typescript
import { state } from "@bloxstack/sdk";

export const playerState = state({
	money: 0,
	level: 1,
	items: [] as string[],

	// Computed values
	get canAfford() {
		return (price: number) => this.money >= price;
	},

	// Actions
	addMoney(amount: number) {
		this.money += amount;
	},

	addItem(itemId: string) {
		this.items.push(itemId);
	},
});

// Usage
playerState.addMoney(100);
playerState.addItem("sword");
console.log(playerState.canAfford(50)); // true
```

### Reactive Atoms

```typescript
import { createAtom, computed } from "@bloxstack/sdk";

// Simple atom
const healthAtom = createAtom(100);

healthAtom.set(75);
console.log(healthAtom.get()); // 75

// Computed atom
const healthPercentage = computed(() => {
	return (healthAtom.get() / 100) * 100;
});

console.log(healthPercentage.get()); // 75
```

## Events System

Events allow server-to-client communication for real-time updates.

### Defining Events

```typescript
// Server route
export const gameRoute = route({
	async startRound() {
		// Game logic...

		// Broadcast event to all clients
		this.onRoundStarted({
			roundNumber: currentRound,
			duration: 60,
			players: activePlayers.map((p) => p.Name),
		});
	},

	onRoundStarted: event<{
		roundNumber: number;
		duration: number;
		players: string[];
	}>(),
});
```

### Handling Events on Client

```typescript
// Client-side event handler (auto-generated)
gameRouteHandler.onRoundStarted.connect((data) => {
	console.log(`Round ${data.roundNumber} started!`);
	console.log(`Duration: ${data.duration} seconds`);
	console.log(`Players: ${data.players.join(", ")}`);

	// Update UI
	updateRoundUI(data);
});
```

## CLI Commands

### `bloxstack dev`

Starts the development server with hot reloading.

```bash
bloxstack dev [options]

Options:
  -p, --port <number>           Rojo server port (default: 34872)
  --client-routes <directory>   Client routes directory (default: src/client/routes)
  --server-routes <directory>   Server routes directory (default: src/server/routes)
  -o, --output <directory>      Output directory (default: src/shared/generated)
```

### `bloxstack create <name>`

Creates a new BloxStack project.

```bash
bloxstack create my-game [options]

Options:
  -t, --template <template>     Project template (basic|fps|shop|simulator)
```

### `bloxstack build`

Builds the project for production.

```bash
bloxstack build
```

### `bloxstack generate <type>`

Generates BloxStack components.

```bash
bloxstack generate route --name shop
bloxstack generate component --name PlayerUI
bloxstack generate service --name DataService
```

## Development Server

The BloxStack development server provides:

- **Hot Reloading**: Automatically regenerates networking code when routes change
- **Type Safety**: Full TypeScript support with type checking
- **Asset Validation**: Validates game assets and reports issues
- **Integrated Tooling**: Runs roblox-ts compiler and Rojo server

### Server Features

1. **Route Discovery**: Automatically finds and analyzes route files
2. **Code Generation**: Generates type-safe networking interfaces
3. **File Watching**: Monitors changes and regenerates code
4. **Error Reporting**: Shows compilation and validation errors
5. **Asset Management**: Validates and optimizes game assets

### Configuration

```typescript
// bloxstack.config.ts
export default {
	routes: {
		clientDirectory: "src/client/routes",
		serverDirectory: "src/server/routes",
		outputDirectory: "src/shared/generated",
	},
	assets: {
		directory: "assets",
		validate: true,
	},
	rojo: {
		port: 34872,
		configFile: "default.project.json",
	},
	typescript: {
		configFile: "tsconfig.json",
		watch: true,
	},
};
```

## Code Generation

BloxStack automatically generates networking code to connect client and server routes.

### Generated Files

#### `networking-interfaces.ts`

Defines the networking interfaces for Flamework.

```typescript
interface ClientToServerFunctions {
	"shop.buyItem": (itemId: string, quantity?: number) => Promise<PurchaseResult>;
	"shop.getShopItems": () => Promise<ShopItem[]>;
}

interface ServerToClientEvents {
	"shop.onItemPurchased": (data: ItemPurchaseEvent) => void;
}
```

#### `route-handlers.ts`

Provides type-safe route handlers for client use.

```typescript
export const shopRouteHandler = {
	async buyItem(itemId: string, quantity?: number) {
		return await clientFunctions["shop.buyItem"].invoke(itemId, quantity);
	},

	onItemPurchased: serverEvents["shop.onItemPurchased"],
};
```

#### `server-connections.ts`

Connects server functions to route implementations.

```typescript
serverFunctions["shop.buyItem"].setCallback(async (player, itemId, quantity) => {
	return await executeWithPlayerContext(player, (...args) => shopRoute.buyItem(...args), itemId, quantity);
});
```

### Generation Process

1. **Route Discovery**: Scans route files using TypeScript AST
2. **Type Analysis**: Extracts method signatures and parameter types
3. **Interface Generation**: Creates networking interfaces
4. **Handler Generation**: Generates type-safe client handlers
5. **Connection Generation**: Creates server-side route connections

## Best Practices

### Route Organization

```typescript
// ✅ Good: Organized by feature
src/server/routes/
├── shop.ts
├── player.ts
├── inventory.ts
└── combat.ts

// ❌ Bad: All in one file
src/server/routes/
└── game.ts (everything)
```

### Error Handling

```typescript
// ✅ Good: Proper error handling
export const shopRoute = route({
	async buyItem(itemId: string) {
		const player = usePlayer();

		try {
			const result = await ShopService.purchase(player, itemId);
			return { success: true, data: result };
		} catch (error) {
			return { success: false, error: error.message };
		}
	},
});

// ❌ Bad: Unhandled errors
export const shopRoute = route({
	async buyItem(itemId: string) {
		const player = usePlayer();
		return await ShopService.purchase(player, itemId); // May throw
	},
});
```

### State Management

```typescript
// ✅ Good: Centralized state
export const gameState = state({
	currentRound: 0,
	players: [] as Player[],

	startRound() {
		this.currentRound++;
		// Logic here
	},
});

// ❌ Bad: Scattered state
let currentRound = 0; // Global variable
const players: Player[] = []; // Another global
```

### Type Safety

```typescript
// ✅ Good: Well-typed interfaces
interface ShopItem {
	id: string;
	name: string;
	price: number;
	category: "weapon" | "armor" | "consumable";
}

export const shopRoute = route({
	async buyItem(itemId: string): Promise<PurchaseResult> {
		// Implementation with proper types
	},
});

// ❌ Bad: Any types
export const shopRoute = route({
	async buyItem(itemId: any): Promise<any> {
		// Loses type safety
	},
});
```

### Performance

```typescript
// ✅ Good: Efficient data structures
export const playerState = state({
	items: new Map<string, number>(), // Use Map for O(1) lookups

	addItem(itemId: string, quantity: number) {
		const current = this.items.get(itemId) || 0;
		this.items.set(itemId, current + quantity);
	},
});

// ❌ Bad: Inefficient searches
export const playerState = state({
	items: [] as { id: string; quantity: number }[], // O(n) searches

	addItem(itemId: string, quantity: number) {
		const existing = this.items.find((item) => item.id === itemId);
		// Inefficient linear search
	},
});
```

---

## Getting Help

- **Documentation**: Check this guide and inline code comments
- **Examples**: Look at the example project in `examples/bloxstack-example-project`
- **Community**: Join the BloxStack Discord server
- **Issues**: Report bugs on the GitHub repository

Happy coding with BloxStack! 🚀
