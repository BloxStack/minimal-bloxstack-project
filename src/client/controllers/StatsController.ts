import { Controller, OnStart } from "@flamework/core";
import { RouterRuntime } from "shared/bloxstack";
import { expectClientRuntime, QueryClientProvider, useQuery } from "@bloxstack/sdk";
import React from "@rbxts/react";

function StatsView() {
	const { api } = expectClientRuntime(RouterRuntime);
	const { data, status } = useQuery(api.player.getStats.queryOptions({ page: 1, limit: 10 }));
	print("stats status", status, data);
	return undefined as unknown as React.Element;
}

@Controller()
export class StatsController implements OnStart {
	onStart() {
		// In a real app, you'd mount a React tree and wrap with QueryClientProvider.
		// For demo purposes, we'll just trigger a fetch and log.
		const { api } = expectClientRuntime(RouterRuntime);
		api.player.getStats.fetch({ page: 1, limit: 10 }).then((res) => print("fetch: ", res));
	}
}
