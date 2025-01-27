/**
 * To test against the packaged code to ensure the end project can import/require the package correctly.
 */
import { createRequire } from "node:module";
import { resolve as resolvePath } from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
const require = createRequire(import.meta.url);

describe("package", () => {
  test("esm", async () => {
    await expect(import("bind4")).resolves.toMatchObject({
      // todo
    });
  });
  test("cjs", () => {
    expect(require.resolve("bind4")).toBe(
      resolvePath("./dist/cjs/index.cjs")
    );
    expect(require("bind4")).toMatchObject({
      // todo
    });
  });
});
