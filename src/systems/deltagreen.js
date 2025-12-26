export function init() {
  Hooks.on("renderActorSheet", () => {
    sortSkillsAlpha();
  });
}

function sortSkillsAlpha() {
  const lists = document.getElementsByClassName("grid grid-3col");
  for (const list of lists) {
    const competences = list.childNodes;
    const complist = [];
    for (const sk of competences) {
      if (sk.textContent && sk.tagName === "DIV") {
        complist.push(sk);
      }
    }
    complist.sort((a, b) => a.textContent.localeCompare(b.textContent));
    for (const sk of complist) {
      list.appendChild(sk);
    }
  }
}
