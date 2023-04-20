export function InitSFRPGBB() {
  Hooks.on("renderItemSheet", (sheet) => {
    sheet.setPosition({ width: 685 });
  });
}
