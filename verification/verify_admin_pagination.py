
from playwright.sync_api import Page, expect, sync_playwright

def verify_admin_pagination():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set large viewport to ensure sidebar is visible
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            # 1. Navigate to the mock admin page
            print("Navigating to /admin-mock...")
            page.goto("http://localhost:3000/admin-mock")

            # Debug: Screenshot initial state
            page.screenshot(path="verification/debug_initial.png")

            # 2. Switch to Users tab
            print("Switching to Users tab...")
            # Check if button exists
            if page.get_by_role("button", name="Users").count() == 0:
                print("Users button not found! Dumping layout...")
                print(page.content())
                return

            page.get_by_role("button", name="Users").click()

            # 3. Verify 'Rows per page' dropdown exists
            print("Verifying dropdown...")
            # Select element - wait for it
            select = page.locator("select").first
            expect(select).to_be_visible()

            # 4. Verify Pagination Controls
            print("Verifying pagination controls...")
            next_btn = page.get_by_role("button", name="Next")
            prev_btn = page.get_by_role("button", name="Previous")

            expect(next_btn).to_be_visible()
            expect(prev_btn).to_be_visible()
            expect(prev_btn).to_be_disabled() # Should be disabled on page 1

            # 5. Click Next and verify page number changes
            print("Clicking Next...")
            next_btn.click()
            expect(page.get_by_text("Page 2")).to_be_visible()
            expect(prev_btn).not_to_be_disabled()

            # 6. Screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/admin_pagination.png")
            print("Verification complete!")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/debug_error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_admin_pagination()
