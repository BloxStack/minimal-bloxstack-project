import React from "@rbxts/react";
import { useKeyPress, useEventListener } from "@rbxts/pretty-react-hooks";
import { usePx } from "./hooks";
import { gameActions } from "./atoms";
import { Leaderboard } from "./components/leaderboard";
import { TimerDisplay } from "./components/timer-display";
import { PersonalStats } from "./components/personal-stats";
import { Notification } from "./components/notification";

export function App() {
	const px = usePx();

	// Keyboard controls for toggling UI elements
	const tabPressed = useKeyPress(["Tab"]);
	const lPressed = useKeyPress(["L"]);
	const tPressed = useKeyPress(["T"]);
	const pPressed = useKeyPress(["P"]);

	// Handle keyboard shortcuts
	React.useEffect(() => {
		if (tabPressed) {
			gameActions.toggleLeaderboard();
		}
	}, [tabPressed]);

	React.useEffect(() => {
		if (lPressed) {
			gameActions.toggleLeaderboard();
		}
	}, [lPressed]);

	React.useEffect(() => {
		if (tPressed) {
			gameActions.toggleTimer();
		}
	}, [tPressed]);

	React.useEffect(() => {
		if (pPressed) {
			gameActions.togglePersonalStats();
		}
	}, [pPressed]);

	return (
		<screengui ResetOnSpawn={false} ZIndexBehavior={Enum.ZIndexBehavior.Sibling}>
			{/* Main UI Container */}
			<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} BorderSizePixel={0}>
				{/* Timer Display */}
				<TimerDisplay />

				{/* Leaderboard */}
				<Leaderboard />

				{/* Personal Stats */}
				<PersonalStats />

				{/* Notification System */}
				<Notification />

				{/* Controls Help Panel */}
				<frame
					Size={UDim2.fromOffset(px(200), px(120))}
					Position={UDim2.fromOffset(px(20), px(720))}
					AnchorPoint={new Vector2(0, 1)}
					BackgroundColor3={Color3.fromRGB(15, 15, 20)}
					BackgroundTransparency={0.3}
					BorderSizePixel={0}
				>
					<uicorner CornerRadius={new UDim(0, px(6))} />
					<uistroke Color={Color3.fromRGB(40, 40, 50)} Thickness={px(1)} />

					<textlabel
						Size={UDim2.fromOffset(px(200), px(16))}
						Position={UDim2.fromOffset(0, px(4))}
						Text="🎮 CONTROLS"
						TextColor3={Color3.fromRGB(150, 200, 255)}
						TextSize={px(12)}
						Font={Enum.Font.GothamBold}
						BackgroundTransparency={1}
						TextXAlignment={Enum.TextXAlignment.Center}
					/>

					<textlabel
						Size={UDim2.fromOffset(px(180), px(80))}
						Position={UDim2.fromOffset(px(10), px(24))}
						Text="TAB/L - Toggle Leaderboard\nT - Toggle Timer\nP - Toggle Stats\nSPACE - Jump"
						TextColor3={Color3.fromRGB(200, 200, 200)}
						TextSize={px(10)}
						Font={Enum.Font.Gotham}
						BackgroundTransparency={1}
						TextXAlignment={Enum.TextXAlignment.Left}
						TextYAlignment={Enum.TextYAlignment.Top}
						TextWrapped={true}
					/>
				</frame>

				{/* Tower Info Panel */}
				<frame
					Size={UDim2.fromOffset(px(300), px(60))}
					Position={UDim2.fromOffset(px(900), px(20))}
					AnchorPoint={new Vector2(1, 0)}
					BackgroundColor3={Color3.fromRGB(25, 25, 30)}
					BorderSizePixel={0}
				>
					<uicorner CornerRadius={new UDim(0, px(8))} />
					<uistroke Color={Color3.fromRGB(60, 60, 70)} Thickness={px(1)} />

					<textlabel
						Size={UDim2.fromOffset(px(300), px(20))}
						Position={UDim2.fromOffset(0, px(8))}
						Text="🏗️ TOWER OF HELL"
						TextColor3={Color3.fromRGB(255, 100, 100)}
						TextSize={px(16)}
						Font={Enum.Font.GothamBold}
						BackgroundTransparency={1}
						TextXAlignment={Enum.TextXAlignment.Center}
					/>

					<textlabel
						Size={UDim2.fromOffset(px(300), px(16))}
						Position={UDim2.fromOffset(0, px(32))}
						Text="Race to the top! Avoid obstacles!"
						TextColor3={Color3.fromRGB(200, 200, 200)}
						TextSize={px(12)}
						Font={Enum.Font.Gotham}
						BackgroundTransparency={1}
						TextXAlignment={Enum.TextXAlignment.Center}
					/>
				</frame>

				{/* Progress Tracker (Right Side) */}
				<frame
					Size={UDim2.fromOffset(px(80), px(400))}
					Position={UDim2.fromOffset(px(1200), px(200))}
					AnchorPoint={new Vector2(1, 0)}
					BackgroundColor3={Color3.fromRGB(20, 20, 25)}
					BackgroundTransparency={0.2}
					BorderSizePixel={0}
				>
					<uicorner CornerRadius={new UDim(0, px(8))} />

					<textlabel
						Size={UDim2.fromOffset(px(80), px(24))}
						Position={UDim2.fromOffset(0, px(8))}
						Text="HEIGHT"
						TextColor3={Color3.fromRGB(150, 150, 150)}
						TextSize={px(10)}
						Font={Enum.Font.GothamBold}
						BackgroundTransparency={1}
						TextXAlignment={Enum.TextXAlignment.Center}
						Rotation={90}
					/>

					{/* Vertical progress bar would go here */}
					<frame
						Size={UDim2.fromOffset(px(8), px(340))}
						Position={UDim2.fromOffset(px(36), px(40))}
						BackgroundColor3={Color3.fromRGB(40, 40, 45)}
						BorderSizePixel={0}
					>
						<uicorner CornerRadius={new UDim(0, px(4))} />

						{/* This would be dynamically sized based on player progress */}
						<frame
							Size={UDim2.fromOffset(px(8), px(85))} // 25% progress example
							Position={UDim2.fromOffset(0, px(255))}
							AnchorPoint={new Vector2(0, 1)}
							BackgroundColor3={Color3.fromRGB(100, 200, 255)}
							BorderSizePixel={0}
						>
							<uicorner CornerRadius={new UDim(0, px(4))} />
						</frame>
					</frame>
				</frame>

				{/* Game Status Indicator */}
				<frame
					Size={UDim2.fromOffset(px(120), px(40))}
					Position={UDim2.fromOffset(px(640), px(20))}
					AnchorPoint={new Vector2(0.5, 0)}
					BackgroundColor3={Color3.fromRGB(25, 80, 25)}
					BorderSizePixel={0}
				>
					<uicorner CornerRadius={new UDim(0, px(20))} />

					<textlabel
						Size={UDim2.fromOffset(px(120), px(40))}
						Position={UDim2.fromOffset(0, 0)}
						Text="🟢 ACTIVE"
						TextColor3={Color3.fromRGB(50, 255, 50)}
						TextSize={px(12)}
						Font={Enum.Font.GothamBold}
						BackgroundTransparency={1}
						TextXAlignment={Enum.TextXAlignment.Center}
						TextYAlignment={Enum.TextYAlignment.Center}
					/>
				</frame>
			</frame>
		</screengui>
	);
}
