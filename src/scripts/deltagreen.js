export function init() {
	async function sortSkillsAlpha() {
		const lists = document.getElementsByClassName("grid grid-3col");
		for (let list of lists) {
			const competences = list.childNodes;
			let complist = [];
			for (let sk of competences) {
				if (sk.innerText && sk.tagName == "DIV") {
					complist.push(sk);
				}
			}
			complist.sort(function (a, b) {
				return a.innerText.localeCompare(b.innerText);
			});
			for (let sk of complist) {
				list.appendChild(sk);
			}
		}
	}

	Hooks.on("renderActorSheet", async function () {
		sortSkillsAlpha();
	});
}
