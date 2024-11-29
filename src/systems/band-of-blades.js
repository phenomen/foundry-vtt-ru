import { setupBabele, translateValue } from "../shared.js";

export function init() {
	setupBabele("band-of-blades");
	registerConverters();
}

function registerConverters() {
	if (!game.babele) return;

	game.babele.registerConverters({
		classConverter: (cls) => {
			if (!cls) return;
			return translateValue(cls, CLASSES);
		},

		effectsConverter: (effects, translations) => {
			if (!effects || !translations) return;
			return effects.map((effect) => {
				if (effect.name && translations[effect.name]) {
					effect.name = translations[effect.name];
				}
				return effect;
			});
		},
	});
}

const CLASSES = {
	Heavy: "Гоплит",
	Medic: "Врач",
	Officer: "Офицер",
	Rookie: "Новобранец",
	Scout: "Разведчик",
	Sniper: "Снайпер",
	Soldier: "Солдат",
	Panyar: "Паньяр",
	Bartan: "Бартан",
	Orite: "Орите",
	Zemyati: "Земьяти",
	General: "Общий",
};
