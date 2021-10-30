export function InitDND5() {
  async function sortSkillsAlpha() {
    const lists = document.getElementsByClassName("skills-list");
    for (let list of lists) {
      const competences = list.childNodes;
      let complist = [];
      for (let sk of competences) {
        if (sk.innerText && sk.tagName == "LI") {
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

  if (typeof Babele !== "undefined") {
    Babele.get().register({
      module: "ru-ru",
      lang: "ru",
      dir: "compendium/dnd5e",
    });
  }

  Hooks.once("ready", async function () {
    if (typeof Babele === "undefined" && game.user.isGM) {
      new Dialog({
        title: "Перевод библиотек",
        content: `<p>Для перевода библиотек системы D&D5 требуется установить и активировать модуль Babele.<p>`,
        buttons: {
          done: {
            label: "Хорошо",
          },
        },
      }).render(true);
    }
  });
}
