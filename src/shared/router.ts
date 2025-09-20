import { createRouter } from "@bloxstack/sdk";
import { t } from "@rbxts/t";

interface Ctx {
	player: Player;
}

const r = createRouter<Ctx>();
const procedure = r.procedure();

// tRPC-style: define procedures directly inline in the router for symbol preservation
export const AppRouter = r.router({
	player: {
		getStats: procedure
			.input(
				t.interface({
					page: t.optional(t.number),
					limit: t.optional(t.number),
				}),
			)
			.query(async ({ ctx }) => {
				// mock data for demo purposes
				return { kills: math.random(0, 50), deaths: math.random(0, 20) };
			}),
	},
});

export type AppRouterType = typeof AppRouter;
