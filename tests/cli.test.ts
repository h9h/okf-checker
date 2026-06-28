import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { main } from "../src/cli";

const FIXTURES = join(import.meta.dir, "fixtures");

describe("cli", () => {
  it("returns 0 and prints usage for --help", () => {
    expect(main(["--help"])).toBe(0);
  });

  it("returns 2 when no command is given", () => {
    expect(main([])).toBe(2);
  });

  it("returns 2 for an unknown command", () => {
    expect(main(["bogus"])).toBe(2);
  });

  it("returns 2 when check is given no bundle directory", () => {
    expect(main(["check"])).toBe(2);
  });

  it("returns 2 when check is given a nonexistent bundle directory", () => {
    expect(main(["check", "/no/such/bundle/dir"])).toBe(2);
  });

  it("returns 0 for check against a conformant bundle", () => {
    expect(main(["check", join(FIXTURES, "valid-bundle")])).toBe(0);
  });

  it("returns 1 for check against a bundle with conformance errors", () => {
    expect(main(["check", join(FIXTURES, "missing-type")])).toBe(1);
  });

  it("supports --json output without changing the exit code", () => {
    expect(main(["check", join(FIXTURES, "valid-bundle"), "--json"])).toBe(0);
  });
});
