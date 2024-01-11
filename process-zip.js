import archiver from "archiver";
import { createWriteStream } from "node:fs";
import "dotenv/config";

const mod = process.env.MODULE_NAME;

const output = createWriteStream(`${mod}.zip`);
const archive = archiver("zip", {
	zlib: { level: 9 }
});

console.log("Packing into ZIP...");

archive.on("error", function (err) {
	throw err;
});
archive.directory(mod, false);
archive.pipe(output);
archive.finalize();
