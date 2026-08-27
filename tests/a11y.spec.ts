import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function scan(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  if (results.violations.length > 0) {
    console.log(
      JSON.stringify(
        results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.map((n) => n.target),
        })),
        null,
        2,
      ),
    );
  }
  return results.violations;
}

test("no WCAG A/AA violations on the default view", async ({ page }) => {
  await page.goto("/");
  expect(await scan(page)).toEqual([]);
});

test("no WCAG A/AA violations after opening benchmarks and entering data", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("details.advanced > summary").click();
  await page.fill("#inquiries", "150");
  await page.fill("#matterValue", "12000");
  expect(await scan(page)).toEqual([]);
});

test("no WCAG A/AA violations in the zero / empty state", async ({ page }) => {
  await page.goto("/");
  await page.fill("#inquiries", "0");
  expect(await scan(page)).toEqual([]);
});
