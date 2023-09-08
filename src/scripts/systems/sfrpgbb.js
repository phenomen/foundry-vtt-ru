export function init() {
	Hooks.on("renderItemSheet", (sheet) => {
		sheet.setPosition({ width: 685 });
	});
}
