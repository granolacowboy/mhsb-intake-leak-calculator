import { test, expect } from "@playwright/test";

test("renders the default estimate and captures a screenshot", async ({
  page,
}) => {
  await page.goto("/");
  const headline = page.locator("#headline-number");
  await expect(headline).toHaveText("$83,973");
  await expect(page.locator("#captured-value")).toHaveText("$57,154");
  await expect(page.locator("#matters-value")).toHaveText("26.7");

  // Breakdown stages all render a dollar figure.
  for (const key of ["answer", "response", "followup", "show", "signing"]) {
    await expect(page.locator(`#amount-${key}`)).toContainText("$");
  }

  await page.screenshot({
    path: "docs/screenshot-desktop.png",
    fullPage: true,
  });
});

test("recomputes live and reflects state in the URL", async ({ page }) => {
  await page.goto("/");
  const headline = page.locator("#headline-number");

  // Quadruple the inquiries; the leak should scale up and the URL should track it.
  await page.fill("#inquiries", "200");
  await expect(headline).not.toHaveText("$83,973");
  await expect(page).toHaveURL(/i=200/);

  // Selecting a practice area pre-fills the matter value.
  await page.selectOption("#practiceArea", "personal-injury");
  await expect(page.locator("#matterValue")).toHaveValue("8000");
  await expect(page).toHaveURL(/p=personal-injury/);
});

test("shares a link that restores the same estimate", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.fill("#inquiries", "77");
  await page.fill("#matterValue", "5000");
  const headlineText = await page.locator("#headline-number").textContent();

  await page.click("#btn-copy");
  await expect(page.locator("#btn-copy")).toHaveText("Link copied");
  const shared = page.url();
  expect(shared).toMatch(/i=77/);

  // Open the shared URL fresh: the estimate is restored.
  const fresh = await context.newPage();
  await fresh.goto(shared);
  await expect(fresh.locator("#inquiries")).toHaveValue("77");
  await expect(fresh.locator("#headline-number")).toHaveText(
    headlineText ?? "",
  );
});

test("zero inquiries shows the empty state and a zero headline", async ({
  page,
}) => {
  await page.goto("/");
  await page.fill("#inquiries", "0");
  await expect(page.locator("#headline-number")).toHaveText("$0");
  await expect(page.locator("#empty-note")).toBeVisible();
});

test("the CTA links to the diagnostic URL constant", async ({ page }) => {
  await page.goto("/");
  const cta = page.locator("a.btn-cta");
  await expect(cta).toHaveAttribute(
    "href",
    "https://www.mhsbsolutions.com/consultation/",
  );
});
