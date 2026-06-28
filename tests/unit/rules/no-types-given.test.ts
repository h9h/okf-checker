import { describe, expect, it } from "bun:test";
import { noTypesGiven } from "../../../src/rules/warnings/no-types-given";

describe("noTypesGiven", () => {
  it("returns a single warning finding", () => {
    const findings = noTypesGiven();
    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe("warning");
    expect(findings[0]?.rule).toBe("no-types-given");
  });
});
