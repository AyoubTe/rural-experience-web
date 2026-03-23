import { test, expect } from './fixtures/auth.fixture';

test.describe('Booking Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Use MSW to intercept API calls (see next section)
    await page.goto('http://localhost:4200');
  });

  test('explorer can search and find an experience', async ({
                                                              authenticatedPage: page
                                                            }) => {
    await page.goto('http://localhost:4200/experiences');

    // Search
    const searchInput = page.getByPlaceholder(
      /search experiences/i
    );
    await searchInput.fill('lavender');
    await searchInput.press('Enter');

    // Results appear
    await expect(
      page.getByText('Three-Day Lavender Harvest')
    ).toBeVisible();

    // Filter by category
    await page.getByRole('button', { name: /farm life/i }).click();

    // Result count updates
    await expect(
      page.getByText(/experiences found/i)
    ).toBeVisible();
  });

  test('explorer can view experience detail', async ({
                                                       authenticatedPage: page
                                                     }) => {
    await page.goto('http://localhost:4200/experiences/1');

    await expect(
      page.getByRole('heading', { name: 'Three-Day Lavender Harvest' })
    ).toBeVisible();

    await expect(
      page.getByText('Valensole, France')
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: /book now/i })
    ).toBeVisible();
  });

  test('explorer can complete a booking', async ({
                                                   authenticatedPage: page
                                                 }) => {
    await page.goto('http://localhost:4200/experiences/1/book');

    // Fill in dates using the date picker
    const startInput = page.getByLabel(/start date/i);
    await startInput.fill('01/08/2025');

    const endInput = page.getByLabel(/end date/i);
    await endInput.fill('04/08/2025');

    // Set guests
    const guestsInput = page.getByLabel(/guests/i);
    await guestsInput.fill('2');

    // Price summary should appear
    await expect(page.getByText(/total/i)).toBeVisible();
    await expect(page.getByText('€720')).toBeVisible();

    // Submit
    await page.getByRole(
      'button', { name: /request booking/i }
    ).click();

    // Should redirect to booking detail with success banner
    await expect(page).toHaveURL(
      /\/my-bookings\/\d+/
    );
    await expect(
      page.getByText(/booking request sent/i)
    ).toBeVisible();
  });

  test('guard redirects unauthenticated user to login', async ({
                                                                 page
                                                               }) => {
    // Not authenticated — use plain page fixture
    await page.goto('http://localhost:4200/my-bookings');

    // Should redirect to login with returnUrl
    await expect(page).toHaveURL(
      /\/auth\/login\?returnUrl=%2Fmy-bookings/
    );
  });

  test('host can accept a pending booking', async ({
                                                     hostPage: page
                                                   }) => {
    await page.goto('http://localhost:4200/host/bookings');

    // Find a pending booking
    await expect(
      page.getByText('Marie Dupont')
    ).toBeVisible();

    // Accept it
    await page.getByRole('button', { name: /accept/i }).click();

    // Confirmation should appear
    await expect(
      page.getByText(/booking confirmed/i)
    ).toBeVisible();
  });

});
