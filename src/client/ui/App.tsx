import React from "@rbxts/react";
import { QueryClientProvider, useQuery, expectClientRuntime } from "@bloxstack/sdk";
import { RouterRuntime, queryClient } from "shared/bloxstack";

function StatsDisplay() {
	const { api, paths } = expectClientRuntime(RouterRuntime);
	const { data, isLoading, isError, queryError } = useQuery(
		api.player.getStats.queryOptions({ page: 1 }, { staleSeconds: 3 }),
	);

	return (
		<frame Size={UDim2.fromScale(1, 1)}>
			<uilistlayout
				Padding={new UDim(0, 8)}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				VerticalAlignment={Enum.VerticalAlignment.Center}
			/>
			{isLoading && <textlabel Text="Loading..." Size={UDim2.fromOffset(300, 24)} BackgroundTransparency={1} />}
			{isError && (
				<textlabel
					Text={`Error: ${tostring(queryError)}`}
					Size={UDim2.fromOffset(300, 24)}
					BackgroundTransparency={1}
				/>
			)}
			{!isLoading && !isError && (
				<textlabel
					Text={`Kills: ${data!.kills} | Deaths: ${data!.deaths}`}
					Size={UDim2.fromOffset(300, 24)}
					BackgroundTransparency={1}
				/>
			)}
			<textbutton
				Text="Invalidate Path"
				Size={UDim2.fromOffset(200, 36)}
				Event={{
					Activated: () => queryClient.invalidatePath(paths.player.getStats.pathKey()),
				}}
			/>
			<textbutton
				Text="Invalidate QueryKey"
				Size={UDim2.fromOffset(200, 36)}
				Event={{
					Activated: () => queryClient.invalidateKey(api.player.getStats.queryKey({ page: 1 })),
				}}
			/>
		</frame>
	);
}

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<StatsDisplay />
		</QueryClientProvider>
	);
}
