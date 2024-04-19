import { setupBabele } from "../shared.js";

export function init() {
	let error;

	if (
		game.modules.get("swade-core-rules")?.active &&
		game.modules.get("swpf-core-rules")?.active
	) {
		error =
			"Для <b>Savage Pathfinder</b> не требуется модуль <b>SWADE Core Rules</b>. Отключите его, иначе перевод не будет работать.";
	} else if (
		!game.modules.get("swade-core-rules")?.active &&
		game.modules.get("deadlands-core-rules")?.active
	) {
		error =
			"Для <b>Deadlands</b> требуется модуль <b>SWADE Core Rules</b>. Активируйте его, иначе перевод не будет работать.";
	} else if (game.modules.get("swpf-core-rules")?.active) {
		setupBabele("swade/swpf");
	} else if (game.modules.get("swade-core-rules")?.active) {
		setupBabele("swade/core");
	} else {
		setupBabele("swade/basic");
	}

	Hooks.on("ready", () => {
		if (error) {
			ui.notifications.error(error);
		}
	});
}
