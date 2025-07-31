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

	CONFIG.COSMERE.cultures.alethi.label = "Алеткар";
	CONFIG.COSMERE.cultures.azish.label = "Азир";
	CONFIG.COSMERE.cultures.herdazian.label = "Гердаз";
	CONFIG.COSMERE.cultures.thaylen.label = "Тайлена";
	CONFIG.COSMERE.cultures.unkalaki.label = "Пики рогоедов";
	CONFIG.COSMERE.cultures.veden.label = "Йа-Кевед";
	CONFIG.COSMERE.cultures.iriali.label = "Ири";
	CONFIG.COSMERE.cultures.kharbranthian.label = "Харбрант";
	CONFIG.COSMERE.cultures.listener.label = "Слушатели";
	CONFIG.COSMERE.cultures.natan.label = "Натан";
	CONFIG.COSMERE.cultures.reshi.label = "Решийские острова";
	CONFIG.COSMERE.cultures.shin.label = "Шиновар";
	CONFIG.COSMERE.cultures.wayfarer.label = "Странники"; // ???
}

function registerConverters() {
	/* placeholder */
}
