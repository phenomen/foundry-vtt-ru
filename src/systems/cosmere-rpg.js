import { setupBabele } from "../shared.js";

export function init() {
	setupBabele("cosmere-rpg");
	registerConverters();

	Hooks.on("ready", () => {
		patchConfig();
	});
}

function patchConfig() {
	CONFIG.COSMERE.paths.types.radiant.label = "Сияющий";

	CONFIG.COSMERE.power.types.surge.label = "Поток";

	CONFIG.COSMERE.items.equipment.types.fabrial.label = "Фабриаль";

	CONFIG.COSMERE.ancestries.human.label = "Человек";
	CONFIG.COSMERE.ancestries.singer.label = "Певец";

	CONFIG.COSMERE.cultures.alethi.label = "Алети"; // Алеткар
	CONFIG.COSMERE.cultures.azish.label = "Азирцы"; // Азир
	CONFIG.COSMERE.cultures.herdazian.label = "Гердазийцы"; // Гердаз
	CONFIG.COSMERE.cultures.thaylen.label = "Тайленцы"; // Тайлена
	CONFIG.COSMERE.cultures.unkalaki.label = "Ункалаки"; // Пики рогоедов | Альт: Рогоеды
	CONFIG.COSMERE.cultures.veden.label = "Веденцы"; // Йа-Кевед
	CONFIG.COSMERE.cultures.iriali.label = "Ириали"; // Ири
	CONFIG.COSMERE.cultures.kharbranthian.label = "Харбрантийцы"; // Харбрант
	CONFIG.COSMERE.cultures.listener.label = "Слушатели"; // Расколотые равнины | Альт: Паршенди
	CONFIG.COSMERE.cultures.natan.label = "Натанцы"; // Натанатан
	CONFIG.COSMERE.cultures.reshi.label = "Решийцы"; // Решийские острова
	CONFIG.COSMERE.cultures.shin.label = "Шинцы"; // Шиновар
	CONFIG.COSMERE.cultures.wayfarer.label = "Странники"; // Неизвестно
}

function registerConverters() {
	/* placeholder */
}
