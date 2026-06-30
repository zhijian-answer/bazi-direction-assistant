from pathlib import Path
from time import time

from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:3000"
OUTPUT_DIR = Path("output/ui-verification")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def assert_no_horizontal_overflow(page, label):
    overflow = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    if overflow > 1:
        raise AssertionError(f"{label} horizontal overflow: {overflow}px")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)

    desktop = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    console_errors = []
    desktop.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    desktop.goto(BASE_URL, wait_until="domcontentloaded", timeout=60000)
    desktop.locator("h1").wait_for()
    assert "让命理" in desktop.locator("h1").inner_text()
    assert_no_horizontal_overflow(desktop, "desktop landing")
    desktop.screenshot(path=str(OUTPUT_DIR / "desktop-landing.png"), full_page=True)

    desktop.get_by_role("link", name="开始排盘").click()
    desktop.locator("#tool h2").wait_for()
    email = f"ui-{int(time() * 1000)}@example.com"
    desktop.get_by_label("昵称").fill("界面测试")
    desktop.get_by_label("邮箱").fill(email)
    desktop.get_by_label("密码").fill("test123456")
    desktop.get_by_role("button", name="免费注册").click()
    desktop.get_by_role("heading", name="填写后立即排盘").wait_for(timeout=15000)

    desktop.get_by_label("档案名称").fill("测试命盘")
    desktop.get_by_label("出生日期").fill("1990-05-10")
    desktop.locator('input[name="birthTime"]').fill("12:30")
    desktop.get_by_label("出生地").fill("四川省成都市")
    desktop.get_by_role("button", name="立即排盘").click()
    desktop.locator("#result h2").wait_for(timeout=20000)
    desktop.get_by_role("heading", name="四柱八字").wait_for()
    desktop.get_by_role("heading", name="大运与流年").wait_for()
    desktop.get_by_text("双引擎核对", exact=False).wait_for(timeout=15000)
    assert_no_horizontal_overflow(desktop, "desktop result")
    desktop.screenshot(path=str(OUTPUT_DIR / "desktop-result.png"), full_page=True)

    result_state = desktop.context.storage_state()
    mobile_result_context = browser.new_context(
        viewport={"width": 390, "height": 844},
        device_scale_factor=1,
        storage_state=result_state,
    )
    mobile_result = mobile_result_context.new_page()
    mobile_result.goto(BASE_URL, wait_until="domcontentloaded", timeout=60000)
    mobile_result.locator('button[data-panel-id="report"]').last.click()
    mobile_result.locator("#result h2").wait_for(timeout=20000)
    assert_no_horizontal_overflow(mobile_result, "mobile result")
    mobile_result.screenshot(path=str(OUTPUT_DIR / "mobile-result.png"), full_page=True)
    mobile_result_context.close()

    mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
    mobile.goto(BASE_URL, wait_until="domcontentloaded", timeout=60000)
    mobile.locator("h1").wait_for()
    assert "让命理" in mobile.locator("h1").inner_text()
    assert_no_horizontal_overflow(mobile, "mobile landing")
    mobile.screenshot(path=str(OUTPUT_DIR / "mobile-landing.png"), full_page=True)

    if console_errors:
        raise AssertionError(f"browser console errors: {console_errors}")

    browser.close()

print("UI verification passed: landing, registration, chart creation, enhanced result, desktop and mobile overflow checks.")
