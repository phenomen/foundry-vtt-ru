export function InitDUNGEONWORLD() {
    if (typeof Babele !== "undefined") {
        Babele.get().register({
            module: "ru-ru",
            lang: "ru",
            dir: "compendium/dungeonworld",
        });
    }
}