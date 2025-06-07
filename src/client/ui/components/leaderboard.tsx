import React from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { useSpring, useAsync, useUpdateEffect } from "@rbxts/pretty-react-hooks";
import { usePx } from "../hooks";
import { playerProgressesAtom, leaderboardDataAtom, showLeaderboardAtom, towerHeightAtom } from "../atoms";

interface LeaderboardEntry {
	name: string;
	height: number;
	isOnline: boolean;
	progress: number; // 0-1 percentage of tower completion
}

function LeaderboardEntry({
	entry,
	rank,
	px,
}: {
	entry: LeaderboardEntry;
	rank: number;
	px: ReturnType<typeof usePx>;
}) {
	const progressBarWidth = useSpring(entry.progress * px(180));
	const heightColor =
		entry.height > 100
			? Color3.fromRGB(50, 255, 50)
			: entry.height > 50
				? Color3.fromRGB(255, 215, 0)
				: Color3.fromRGB(255, 255, 255);

	const rankColor =
		rank === 1
			? Color3.fromRGB(255, 215, 0) // Gold
			: rank === 2
				? Color3.fromRGB(192, 192, 192) // Silver
				: rank === 3
					? Color3.fromRGB(205, 127, 50) // Bronze
					: Color3.fromRGB(200, 200, 200); // Default

	return (
		<frame
			Size={UDim2.fromOffset(px(200), px(32))}
			BackgroundColor3={entry.isOnline ? Color3.fromRGB(40, 40, 50) : Color3.fromRGB(30, 30, 35)}
			BorderSizePixel={0}
		>
			<uicorner CornerRadius={new UDim(0, px(4))} />

			{/* Rank */}
			<textlabel
				Size={UDim2.fromOffset(px(24), px(32))}
				Position={UDim2.fromOffset(px(4), 0)}
				Text={`${rank}`}
				TextColor3={rankColor}
				TextSize={px(14)}
				Font={Enum.Font.GothamBold}
				BackgroundTransparency={1}
				TextXAlignment={Enum.TextXAlignment.Center}
			/>

			{/* Player Name */}
			<textlabel
				Size={UDim2.fromOffset(px(80), px(16))}
				Position={UDim2.fromOffset(px(32), px(2))}
				Text={entry.name}
				TextColor3={entry.isOnline ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(150, 150, 150)}
				TextSize={px(12)}
				Font={Enum.Font.Gotham}
				BackgroundTransparency={1}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextTruncate={Enum.TextTruncate.AtEnd}
			/>

			{/* Height */}
			<textlabel
				Size={UDim2.fromOffset(px(80), px(14))}
				Position={UDim2.fromOffset(px(32), px(18))}
				Text={`${math.floor(entry.height)}m`}
				TextColor3={heightColor}
				TextSize={px(10)}
				Font={Enum.Font.Gotham}
				BackgroundTransparency={1}
				TextXAlignment={Enum.TextXAlignment.Left}
			/>

			{/* Progress Bar Background */}
			<frame
				Size={UDim2.fromOffset(px(60), px(4))}
				Position={UDim2.fromOffset(px(135), px(14))}
				BackgroundColor3={Color3.fromRGB(20, 20, 25)}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(0, px(2))} />

				{/* Progress Bar Fill */}
				<frame
					Size={progressBarWidth.map((width) => UDim2.fromOffset(width, px(4)))}
					Position={UDim2.fromOffset(0, 0)}
					BackgroundColor3={heightColor}
					BorderSizePixel={0}
				>
					<uicorner CornerRadius={new UDim(0, px(2))} />
				</frame>
			</frame>

			{/* Online Indicator */}
			{entry.isOnline && (
				<frame
					Size={UDim2.fromOffset(px(6), px(6))}
					Position={UDim2.fromOffset(px(190), px(4))}
					BackgroundColor3={Color3.fromRGB(50, 255, 50)}
					BorderSizePixel={0}
				>
					<uicorner CornerRadius={new UDim(0.5, 0)} />
				</frame>
			)}
		</frame>
	);
}

export function Leaderboard() {
	const px = usePx();
	const playerProgresses = useAtom(playerProgressesAtom);
	const leaderboardData = useAtom(leaderboardDataAtom);
	const showLeaderboard = useAtom(showLeaderboardAtom);
	const towerHeight = useAtom(towerHeightAtom);

	// Combine online players with leaderboard data
	const [combinedEntries] = useAsync(async () => {
		const entries: LeaderboardEntry[] = [];

		// Add current online players
		for (const [_, progress] of playerProgresses) {
			entries.push({
				name: progress.displayName,
				height: progress.currentHeight,
				isOnline: true,
				progress: towerHeight > 0 ? progress.currentHeight / towerHeight : 0,
			});
		}

		// Add offline leaderboard players (avoiding duplicates)
		const onlineNames = new Set(entries.map((e) => e.name));
		for (const entry of leaderboardData) {
			if (!onlineNames.has(entry.name)) {
				entries.push({
					name: entry.name,
					height: entry.height,
					isOnline: false,
					progress: towerHeight > 0 ? entry.height / towerHeight : 0,
				});
			}
		}

		// Sort by height descending
		entries.sort((a, b) => a.height < b.height);

		// Get top 10
		const top10: LeaderboardEntry[] = [];
		for (let i = 0; i < math.min(10, entries.size()); i++) {
			top10.push(entries[i]);
		}
		return top10;
	}, [playerProgresses, leaderboardData, towerHeight]);

	if (!showLeaderboard || !combinedEntries) {
		return <></>;
	}

	return (
		<frame
			Size={UDim2.fromOffset(px(220), px(400))}
			Position={UDim2.fromOffset(px(20), px(100))}
			BackgroundColor3={Color3.fromRGB(25, 25, 30)}
			BorderSizePixel={0}
		>
			<uicorner CornerRadius={new UDim(0, px(8))} />
			<uistroke Color={Color3.fromRGB(60, 60, 70)} Thickness={px(1)} />

			{/* Header */}
			<frame
				Size={UDim2.fromOffset(px(220), px(40))}
				Position={UDim2.fromOffset(0, 0)}
				BackgroundColor3={Color3.fromRGB(35, 35, 45)}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(0, px(8))} />

				<textlabel
					Size={UDim2.fromOffset(px(160), px(40))}
					Position={UDim2.fromOffset(px(16), 0)}
					Text="🏆 LEADERBOARD"
					TextColor3={Color3.fromRGB(255, 215, 0)}
					TextSize={px(16)}
					Font={Enum.Font.GothamBold}
					BackgroundTransparency={1}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextYAlignment={Enum.TextYAlignment.Center}
				/>

				<textlabel
					Size={UDim2.fromOffset(px(40), px(40))}
					Position={UDim2.fromOffset(px(175), 0)}
					Text={`${combinedEntries.size()}`}
					TextColor3={Color3.fromRGB(150, 150, 150)}
					TextSize={px(12)}
					Font={Enum.Font.Gotham}
					BackgroundTransparency={1}
					TextXAlignment={Enum.TextXAlignment.Center}
					TextYAlignment={Enum.TextYAlignment.Center}
				/>
			</frame>

			{/* Entries List */}
			<scrollingframe
				Size={UDim2.fromOffset(px(220), px(350))}
				Position={UDim2.fromOffset(0, px(45))}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				CanvasSize={UDim2.fromOffset(0, combinedEntries.size() * px(36))}
				ScrollBarThickness={px(4)}
				ScrollBarImageColor3={Color3.fromRGB(100, 100, 100)}
			>
				<uilistlayout
					FillDirection={Enum.FillDirection.Vertical}
					Padding={new UDim(0, px(4))}
					SortOrder={Enum.SortOrder.LayoutOrder}
				/>

				<uipadding
					PaddingTop={new UDim(0, px(8))}
					PaddingBottom={new UDim(0, px(8))}
					PaddingLeft={new UDim(0, px(10))}
					PaddingRight={new UDim(0, px(10))}
				/>

				{combinedEntries.map((entry, index) => (
					<LeaderboardEntry key={entry.name} entry={entry} rank={index + 1} px={px} />
				))}
			</scrollingframe>
		</frame>
	);
}
