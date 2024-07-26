import { setupBabele } from "../shared.js";

export function init() {
	setupBabele("blades-in-the-dark");

	Hooks.on("ready", () => {
		if (game.system.version.startsWith("4")) {
			ui.notifications.warn(
				"Вы используете устаревшую версию системы. Для корректной работы, обновите систему до 5.0+",
			);
		}
	});
}
