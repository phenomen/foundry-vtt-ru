Hooks.once("init", async () => {
  loadCSS("modules/ru-ru/styles/" + game.system.id + ".css");

// D&D5

  if (game.system.id === "dnd5e") {
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
  }

// DELTA GREEN

  if (game.system.id === "deltagreen") {
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
  
// PATHFINDER 2

  if (game.system.id === "pf2e") {
    if (typeof Babele !== "undefined") {
      Babele.get().register({
        module: "ru-ru",
        lang: "ru",
        dir: "compendium/pf2e",
      });
    }
  }
  
// DUNGEON WORLD

  if (game.system.id === "dungeonworld") {
    if (typeof Babele !== "undefined") {
      Babele.get().register({
        module: "ru-ru",
        lang: "ru",
        dir: "compendium/dungeonworld",
      });
    }
  }

// END
});
