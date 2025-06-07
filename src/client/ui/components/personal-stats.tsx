import React from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { useSpring, useUpdateEffect } from "@rbxts/pretty-react-hooks";
import { usePx } from "../hooks";
import { 
	currentHeightAtom, 
	personalBestAtom, 
	lastCheckpointAtom, 
	showPersonalStatsAtom,
	towerHeightAtom 
} from "../atoms";

export function PersonalStats() {
	const px = usePx();
	const currentHeight = useAtom(currentHeightAtom);
	const personalBest = useAtom(personalBestAtom);
	const lastCheckpoint = useAtom(lastCheckpointAtom);
	const showPersonalStats = useAtom(showPersonalStatsAtom);
	const towerHeight = useAtom(towerHeightAtom);

	// Animated height counter
	const animatedHeight = useSpring(currentHeight);
	const animatedPB = useSpring(personalBest);

	// Progress calculation
	const progress = towerHeight > 0 ? currentHeight / towerHeight : 0;
	const animatedProgress = useSpring(progress * px(180));

	// Color based on progress
	const progressColor = progress > 0.8 ? Color3.fromRGB(50, 255, 50) :
	                     progress > 0.5 ? Color3.fromRGB(255, 215, 0) :
	                     progress > 0.2 ? Color3.fromRGB(255, 150, 50) :
	                     Color3.fromRGB(255, 100, 100);

	// New personal best indicator
	const isNewBest = currentHeight > personalBest && currentHeight > 0;
	const newBestColor = useSpring(isNewBest ? Color3.fromRGB(255, 215, 0) : Color3.fromRGB(100, 100, 100));

	if (!showPersonalStats) {
		return <></>;
	}

	return (
		<frame
			Size={UDim2.fromOffset(px(260), px(180))}
			Position={UDim2.fromOffset(px(20), px(520))}
			BackgroundColor3={Color3.fromRGB(25, 25, 30)}
			BorderSizePixel={0}
		>
			<uicorner CornerRadius={new UDim(0, px(8))} />
			<uistroke Color={Color3.fromRGB(60, 60, 70)} Thickness={px(1)} />

			{/* Header */}
			<frame
				Size={UDim2.fromOffset(px(260), px(32))}
				Position={UDim2.fromOffset(0, 0)}
				BackgroundColor3={Color3.fromRGB(35, 35, 45)}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(0, px(8))} />
				
				<textlabel
					Size={UDim2.fromOffset(px(260), px(32))}
					Position={UDim2.fromOffset(0, 0)}
					Text="📊 YOUR STATS"
					TextColor3={Color3.fromRGB(150, 200, 255)}
					TextSize={px(14)}
					Font={Enum.Font.GothamBold}
					BackgroundTransparency={1}
					TextXAlignment={Enum.TextXAlignment.Center}
					TextYAlignment={Enum.TextYAlignment.Center}
				/>
			</frame>

			{/* Current Height */}
			<frame
				Size={UDim2.fromOffset(px(240), px(36))}
				Position={UDim2.fromOffset(px(10), px(40))}
				BackgroundTransparency={1}
			>
				<textlabel
					Size={UDim2.fromOffset(px(120), px(16))}
					Position={UDim2.fromOffset(0, 0)}
					Text="Current Height"
					TextColor3={Color3.fromRGB(200, 200, 200)}
					TextSize={px(12)}
					Font={Enum.Font.Gotham}
					BackgroundTransparency={1}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>

				<textlabel
					Size={UDim2.fromOffset(px(120), px(20))}
					Position={UDim2.fromOffset(0, px(16))}
					Text={animatedHeight.map(h => `${math.floor(h)}m`)}
					TextColor3={progressColor}
					TextSize={px(18)}
					Font={Enum.Font.GothamBold}
					BackgroundTransparency={1}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>

				{/* Progress Bar */}
				<frame
					Size={UDim2.fromOffset(px(100), px(6))}
					Position={UDim2.fromOffset(px(130), px(22))}
					BackgroundColor3={Color3.fromRGB(40, 40, 45)}
					BorderSizePixel={0}
				>
					<uicorner CornerRadius={new UDim(0, px(3))} />
					
					<frame
						Size={animatedProgress.map(width => UDim2.fromOffset(width, px(6)))}
						Position={UDim2.fromOffset(0, 0)}
						BackgroundColor3={progressColor}
						BorderSizePixel={0}
					>
						<uicorner CornerRadius={new UDim(0, px(3))} />
					</frame>
				</frame>

				{/* Progress Percentage */}
				<textlabel
					Size={UDim2.fromOffset(px(40), px(16))}
					Position={UDim2.fromOffset(px(200), px(20))}
					Text={`${math.floor(progress * 100)}%`}
					TextColor3={Color3.fromRGB(150, 150, 150)}
					TextSize={px(10)}
					Font={Enum.Font.Gotham}
					BackgroundTransparency={1}
					TextXAlignment={Enum.TextXAlignment.Center}
				/>
			</frame>

			{/* Personal Best */}
			<frame
				Size={UDim2.fromOffset(px(240), px(28))}
				Position={UDim2.fromOffset(px(10), px(84))}
				BackgroundTransparency={1}
			>
				<textlabel
					Size={UDim2.fromOffset(px(120), px(16))}
					Position={UDim2.fromOffset(0, 0)}
					Text="Personal Best"
					TextColor3={Color3.fromRGB(200, 200, 200)}
					TextSize={px(12)}
					Font={Enum.Font.Gotham}
					BackgroundTransparency={1}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>

				<textlabel
					Size={UDim2.fromOffset(px(120), px(20))}
					Position={UDim2.fromOffset(0, px(12))}
					Text={animatedPB.map(pb => `${math.floor(pb)}m`)}
					TextColor3={newBestColor}
					TextSize={px(16)}
					Font={Enum.Font.GothamBold}
					BackgroundTransparency={1}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>

				{isNewBest && (
					<textlabel
						Size={UDim2.fromOffset(px(100), px(16))}
						Position={UDim2.fromOffset(px(130), px(12))}
						Text="🎉 NEW BEST!"
						TextColor3={Color3.fromRGB(255, 215, 0)}
						TextSize={px(12)}
						Font={Enum.Font.GothamBold}
						BackgroundTransparency={1}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
				)}
			</frame>

			{/* Last Checkpoint */}
			<frame
				Size={UDim2.fromOffset(px(240), px(28))}
				Position={UDim2.fromOffset(px(10), px(120))}
				BackgroundTransparency={1}
			>
				<textlabel
					Size={UDim2.fromOffset(px(120), px(16))}
					Position={UDim2.fromOffset(0, 0)}
					Text="Last Checkpoint"
					TextColor3={Color3.fromRGB(200, 200, 200)}
					TextSize={px(12)}
					Font={Enum.Font.Gotham}
					BackgroundTransparency={1}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>

				<textlabel
					Size={UDim2.fromOffset(px(120), px(20))}
					Position={UDim2.fromOffset(0, px(12))}
					Text={lastCheckpoint >= 0 ? `Checkpoint ${lastCheckpoint}` : "None"}
					TextColor3={lastCheckpoint >= 0 ? Color3.fromRGB(50, 255, 50) : Color3.fromRGB(150, 150, 150)}
					TextSize={px(14)}
					Font={Enum.Font.GothamBold}
					BackgroundTransparency={1}
					TextXAlignment={Enum.TextXAlignment.Left}
				/>

				{lastCheckpoint >= 0 && (
					<textbutton
						Size={UDim2.fromOffset(px(80), px(20))}
						Position={UDim2.fromOffset(px(150), px(8))}
						Text="Reset to CP"
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextSize={px(10)}
						Font={Enum.Font.Gotham}
						BackgroundColor3={Color3.fromRGB(100, 50, 150)}
						BorderSizePixel={0}
						Event={{
							MouseButton1Click: () => {
								// This will be connected to reset functionality
								print("Reset to checkpoint requested");
							}
						}}
					>
						<uicorner CornerRadius={new UDim(0, px(4))} />
					</textbutton>
				)}
			</frame>
		</frame>
	);
} 