from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        print("Navigating to /notifications...")
        page.goto("http://localhost:3000/notifications")
        page.wait_for_timeout(5000) # Wait for redirect or load

        title = page.title()
        print(f"Page title: {title}")

        page.screenshot(path="verification.png")
        print("Screenshot saved to verification.png")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
