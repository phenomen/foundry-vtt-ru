export function init() {
	Hooks.on("ready", async function () {
		await game.settings.set(
			"forbidden-lands",
			"datasetDir",
			"modules/ru-ru/compendium/fbl/dataset/dataset-ru.json"
		);
		console.log("Активирован перевод конструктора Forbidden Lands");
	});
}
