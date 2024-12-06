import translationData from "./translations.json";
import entriesData from "./data.json";

const translationMap = new Map(translationData.map((item) => [item.en, item.ru]));

for (const entry of Object.values(entriesData.entries)) {
	const translatedName = translationMap.get(entry.name);
	if (translatedName) {
		entry.name = translatedName;
	}
}

await Bun.write("output.json", JSON.stringify(entriesData, null, 2));
