import {
	audioAdapter,
	createBloxStack,
	flameworkAdapter,
	createBloxStackRouter,
	QueryClient,
	remotesRouterAdapter,
} from "@bloxstack/sdk";
import { RunService } from "@rbxts/services";
import { AppRouter, AppRouterType } from "shared/router";

/** In shared */
const soundEffects = {
	OOF: 1,
};

export const SharedBloxstack = createBloxStack({
	debugMode: true,
	adapters: [
		audioAdapter({
			SoundEffects: soundEffects,
		}),
		// flameworkAdapter({
		// 	ClientPaths: ["src/client/controllers"],
		// 	ServerPaths: ["src/server/services"],
		// }),
	] as const,
});

// Router wiring (shared)
export function createRouterContext({ player }: { player: Player }) {
	const playerStats = { money: 100 };
	return { player, playerStats };
}

// Optional: provide a query client for client-side invalidation
export const queryClient = new QueryClient({ defaultStaleSeconds: 5 });

const routerAdapter = remotesRouterAdapter({ namespace: "bloxstack" });
const transport = RunService.IsClient() ? routerAdapter.client() : routerAdapter.server();

export const RouterRuntime = createBloxStackRouter(AppRouter, {
	transport,
	createContext: createRouterContext,
	queryClient,
});
