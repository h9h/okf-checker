import { describe, expect, it } from "bun:test";
import { main } from "../src/cli";

describe("cli", () => {
  it("runs without crashing and returns exit code 0", () => {
    expect(main()).toBe(0);
  });
});
