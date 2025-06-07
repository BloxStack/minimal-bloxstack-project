import React from "@rbxts/react";
import { useAtom } from "@rbxts/react-charm";
import { useSpring, useMotion, useMountEffect, useUnmountEffect } from "@rbxts/pretty-react-hooks";
import { usePx } from "../hooks";
import { notificationTextAtom, notificationTypeAtom, showNotificationAtom } from "../atoms";

export function Notification() {
	const px = usePx();
	const notificationText = useAtom(notificationTextAtom);
	const notificationType = useAtom(notificationTypeAtom);
	const showNotification = useAtom(showNotificationAtom);

	const [slideY, slideYMotor] = useMotion(-px(100));
	const [opacity, opacityMotor] = useMotion(0);

	// Color and icon based on notification type
	const typeConfig = {
		success: {
			color: Color3.fromRGB(50, 255, 50),
			bgColor: Color3.fromRGB(25, 80, 25),
			icon: "✅",
		},
		warning: {
			color: Color3.fromRGB(255, 200, 50),
			bgColor: Color3.fromRGB(80, 70, 25),
			icon: "⚠️",
		},
		error: {
			color: Color3.fromRGB(255, 100, 100),
			bgColor: Color3.fromRGB(80, 25, 25),
			icon: "❌",
		},
		info: {
			color: Color3.fromRGB(100, 200, 255),
			bgColor: Color3.fromRGB(25, 50, 80),
			icon: "ℹ️",
		},
	};

	const config = typeConfig[notificationType];
	const backgroundColor = useSpring(config.bgColor);
	const textColor = useSpring(config.color);

	// Animation effects
	useMountEffect(() => {
		if (showNotification) {
			slideYMotor.spring(px(20), { frequency: 4, damping: 0.8 });
			opacityMotor.spring(1, { frequency: 6, damping: 0.9 });
		}
	});

	useUnmountEffect(() => {
		slideYMotor.spring(-px(100), { frequency: 6, damping: 1 });
		opacityMotor.spring(0, { frequency: 8, damping: 1 });
	});

	// Handle show/hide animations
	React.useEffect(() => {
		if (showNotification) {
			slideYMotor.spring(px(20), { frequency: 4, damping: 0.8 });
			opacityMotor.spring(1, { frequency: 6, damping: 0.9 });
		} else {
			slideYMotor.spring(-px(100), { frequency: 6, damping: 1 });
			opacityMotor.spring(0, { frequency: 8, damping: 1 });
		}
	}, [showNotification]);

	if (!showNotification && opacity.getValue() === 0) {
		return <></>;
	}

	return (
		<frame
			Size={UDim2.fromOffset(px(400), px(60))}
			Position={slideY.map((y) => UDim2.fromOffset(px(650), y))}
			AnchorPoint={new Vector2(0.5, 0)}
			BackgroundColor3={backgroundColor}
			BackgroundTransparency={opacity.map((o) => 1 - o)}
			BorderSizePixel={0}
		>
			<uicorner CornerRadius={new UDim(0, px(8))} />
			<uistroke Color={textColor} Thickness={px(2)} Transparency={opacity.map((o) => 1 - o)} />

			{/* Drop shadow effect */}
			<frame
				Size={UDim2.fromScale(1, 1)}
				Position={UDim2.fromOffset(px(2), px(2))}
				BackgroundColor3={Color3.fromRGB(0, 0, 0)}
				BackgroundTransparency={0.8}
				BorderSizePixel={0}
				ZIndex={-1}
			>
				<uicorner CornerRadius={new UDim(0, px(8))} />
			</frame>

			{/* Icon */}
			<textlabel
				Size={UDim2.fromOffset(px(40), px(60))}
				Position={UDim2.fromOffset(px(16), 0)}
				Text={config.icon}
				TextColor3={textColor}
				TextSize={px(24)}
				Font={Enum.Font.GothamBold}
				BackgroundTransparency={1}
				TextXAlignment={Enum.TextXAlignment.Center}
				TextYAlignment={Enum.TextYAlignment.Center}
				TextTransparency={opacity.map((o) => 1 - o)}
			/>

			{/* Message text */}
			<textlabel
				Size={UDim2.fromOffset(px(320), px(60))}
				Position={UDim2.fromOffset(px(60), 0)}
				Text={notificationText}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				TextSize={px(14)}
				Font={Enum.Font.Gotham}
				BackgroundTransparency={1}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextYAlignment={Enum.TextYAlignment.Center}
				TextWrapped={true}
				TextTransparency={opacity.map((o) => 1 - o)}
			/>

			{/* Close button */}
			<textbutton
				Size={UDim2.fromOffset(px(20), px(20))}
				Position={UDim2.fromOffset(px(370), px(10))}
				Text="×"
				TextColor3={Color3.fromRGB(200, 200, 200)}
				TextSize={px(16)}
				Font={Enum.Font.GothamBold}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				TextTransparency={opacity.map((o) => 1 - o)}
				Event={{
					MouseButton1Click: () => {
						showNotificationAtom(false);
					},
					MouseEnter: (rbx) => {
						rbx.TextColor3 = Color3.fromRGB(255, 255, 255);
					},
					MouseLeave: (rbx) => {
						rbx.TextColor3 = Color3.fromRGB(200, 200, 200);
					},
				}}
			/>

			{/* Progress bar for auto-dismiss */}
			<frame
				Size={UDim2.fromOffset(px(400), px(3))}
				Position={UDim2.fromOffset(0, px(57))}
				BackgroundColor3={Color3.fromRGB(0, 0, 0)}
				BackgroundTransparency={0.5}
				BorderSizePixel={0}
			>
				<frame
					Size={UDim2.fromScale(1, 1)}
					Position={UDim2.fromOffset(0, 0)}
					BackgroundColor3={textColor}
					BorderSizePixel={0}
					BackgroundTransparency={opacity.map((o) => 1 - o * 0.7)}
				>
					{/* This could be animated based on remaining time */}
				</frame>
			</frame>
		</frame>
	);
}
