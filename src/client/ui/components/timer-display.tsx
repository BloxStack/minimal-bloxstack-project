import React from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { useSpring, useLifetime } from "@rbxts/pretty-react-hooks";
import { usePx } from "../hooks";
import { timeRemainingAtom, showTimerAtom } from "../atoms";

function formatTime(seconds: number): string {
	const mins = math.floor(seconds / 60);
	const secs = math.floor(seconds % 60);
	return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function TimerDisplay() {
	const px = usePx();
	const timeRemaining = useAtom(timeRemainingAtom);
	const showTimer = useAtom(showTimerAtom);
	const lifetime = useLifetime();

	// Color changes based on urgency
	const urgentColor = timeRemaining < 60 ? Color3.fromRGB(255, 100, 100) : 
	                    timeRemaining < 120 ? Color3.fromRGB(255, 200, 100) : 
	                    Color3.fromRGB(100, 255, 100);

	// Animated background color
	const backgroundColor = useSpring(urgentColor);

	// Pulse effect when time is running low
	const pulseScale = timeRemaining < 30 
		? lifetime.map(t => 1 + math.sin(t * 8) * 0.1)
		: useSpring(1);

	// Progress bar for visual time representation (5 minutes total)
	const progressWidth = useSpring((timeRemaining / 300) * px(200));

	if (!showTimer) {
		return <></>;
	}

	return (
		<frame
			Size={pulseScale.map(scale => UDim2.fromOffset(px(240) * scale, px(80) * scale))}
			Position={UDim2.fromOffset(px(20), px(20))}
			AnchorPoint={new Vector2(0, 0)}
			BackgroundColor3={Color3.fromRGB(25, 25, 30)}
			BorderSizePixel={0}
		>
			<uicorner CornerRadius={new UDim(0, px(12))} />
			<uistroke Color={backgroundColor} Thickness={px(2)} />

			{/* Header */}
			<textlabel
				Size={UDim2.fromOffset(px(240), px(24))}
				Position={UDim2.fromOffset(0, px(8))}
				Text="⏰ TOWER RESET"
				TextColor3={Color3.fromRGB(200, 200, 200)}
				TextSize={px(12)}
				Font={Enum.Font.GothamBold}
				BackgroundTransparency={1}
				TextXAlignment={Enum.TextXAlignment.Center}
			/>

			{/* Time Display */}
			<textlabel
				Size={UDim2.fromOffset(px(240), px(28))}
				Position={UDim2.fromOffset(0, px(32))}
				Text={formatTime(timeRemaining)}
				TextColor3={backgroundColor}
				TextSize={px(24)}
				Font={Enum.Font.GothamBold}
				BackgroundTransparency={1}
				TextXAlignment={Enum.TextXAlignment.Center}
			/>

			{/* Progress Bar Background */}
			<frame
				Size={UDim2.fromOffset(px(200), px(6))}
				Position={UDim2.fromOffset(px(20), px(65))}
				BackgroundColor3={Color3.fromRGB(40, 40, 45)}
				BorderSizePixel={0}
			>
				<uicorner CornerRadius={new UDim(0, px(3))} />

				{/* Progress Bar Fill */}
				<frame
					Size={progressWidth.map(width => UDim2.fromOffset(width, px(6)))}
					Position={UDim2.fromOffset(0, 0)}
					BackgroundColor3={backgroundColor}
					BorderSizePixel={0}
				>
					<uicorner CornerRadius={new UDim(0, px(3))} />
				</frame>
			</frame>

			{/* Warning text when low */}
			{timeRemaining < 30 && (
				<textlabel
					Size={UDim2.fromOffset(px(240), px(12))}
					Position={UDim2.fromOffset(0, px(72))}
					Text="NEW TOWER INCOMING!"
					TextColor3={Color3.fromRGB(255, 100, 100)}
					TextSize={px(10)}
					Font={Enum.Font.GothamBold}
					BackgroundTransparency={1}
					TextXAlignment={Enum.TextXAlignment.Center}
				/>
			)}
		</frame>
	);
} 