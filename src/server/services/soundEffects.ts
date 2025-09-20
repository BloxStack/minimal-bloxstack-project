import { OnStart, Service } from "@flamework/core";
import { Players } from "@rbxts/services";
import { ServerBloxstack } from "server/bloxstack";

@Service()
export class SoundEffects implements OnStart {
	private onPlayer(player: Player) {
		ServerBloxstack.audio.play(player, "OOF");
	}

	onStart() {
		Players.PlayerAdded.Connect((plr) => this.onPlayer(plr));
	}
}
