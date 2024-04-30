import { expect, test, describe } from "bun:test";
import { parseParentheses } from "../src/shared.js";

describe("Parse a string with parentheses", () => {
	test("Hello World (Foo Bar)", () => {
		expect(parseParentheses("Hello World (Foo Bar)")).toMatchObject({
			main: "Hello World",
			sub: "Foo Bar",
		});
	});

	test("Hello World  ( Foo Bar)", () => {
		expect(parseParentheses("Hello World  ( Foo Bar)")).toMatchObject({
			main: "Hello World",
			sub: "Foo Bar",
		});
	});

	test("Hello World", () => {
		expect(parseParentheses("Hello World")).toMatchObject({
			main: "Hello World",
			sub: undefined,
		});
	});

	test("Hello World ()", () => {
		expect(parseParentheses("Hello World ()")).toMatchObject({
			main: "Hello World",
			sub: undefined,
		});
	});

	test("Hello World ( )", () => {
		expect(parseParentheses("Hello World ( )")).toMatchObject({
			main: "Hello World",
			sub: undefined,
		});
	});
});
