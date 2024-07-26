export function init() {
	async function sortSkillsAlpha() {
		const lists = document.getElementsByClassName("grid grid-3col");
		for (const list of lists) {
			const competences = list.childNodes;
			const complist = [];
			for (const sk of competences) {
				if (sk.innerText && sk.tagName === "DIV") {
					complist.push(sk);
				}
			}
			complist.sort((a, b) => a.innerText.localeCompare(b.innerText));
			for (const sk of complist) {
				list.appendChild(sk);
			}
		}
	}

	Hooks.on("renderActorSheet", async () => {
		sortSkillsAlpha();
	});
}
