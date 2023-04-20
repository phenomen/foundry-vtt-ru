import archiver from "archiver";
import { createWriteStream } from "node:fs";

const output = createWriteStream("ru-ru.zip");
const archive = archiver("zip", {
  zlib: { level: 9 },
});

archive.directory("ru-ru", false);

console.log("Packing a ZIP...");
archive.pipe(output);
archive.finalize();
