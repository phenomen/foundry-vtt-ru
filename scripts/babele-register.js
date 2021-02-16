// Babele registration
Hooks.once('init', () => {
	if (game.system.id == "wfrp4e") {
		Babele.get().register({
			module: 'ru-RU',
			lang: 'ru',
			dir: 'compendium/wfrp4e'
		});
	}
});
