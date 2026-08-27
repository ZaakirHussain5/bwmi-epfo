import { describe, expect, it } from "vitest";
import { retrieveKnowledge } from "./retrieve";

describe("EPF knowledge retrieval", () => {
  it("returns medical claim guidance for claim questions", () => {
    const articles = retrieveKnowledge("how do I submit a medical advance claim");
    expect(articles.length).toBeGreaterThan(0);
    expect(articles.some((article) => article.id === "kb-medical-advance")).toBe(true);
  });

  it("keeps the disclaimer discoverable", () => {
    const articles = retrieveKnowledge("is this official EPFO advice");
    expect(articles.some((article) => article.id === "kb-disclaimer")).toBe(true);
  });
});
