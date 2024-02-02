import { defineConfig } from "bumpp";

export default defineConfig({
	files: ["./public/module.json", "./README.md"],
	commit: false,
	tag: false,
	push: false
});
