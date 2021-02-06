Hooks.once("init", async () => {
  loadCSS("modules/ru-RU/styles/" + game.system.id + ".css");

  if (game.system.id === "dnd5e") {
    // Sort skills alphabetically
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
          return a.innerText > b.innerText ? 1 : -1;
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
});
