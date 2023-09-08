import archiver from "archiver";
import { createWriteStream } from "node:fs";

const output = createWriteStream("ru-ru.zip");
const archive = archiver("zip", {
	zlib: { level: 9 }
});

console.log("Packing into ZIP...");

archive.on("error", function (err) {
	throw err;
});
archive.directory("ru-ru", false);
archive.pipe(output);
archive.finalize();
