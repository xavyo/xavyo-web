#!/usr/bin/env node
/**
 * E2E Provision Flow Tests for xavyo-web
 * Tests the full flow: signup → onboarding → dashboard → CRUD → logout → re-login
 *
 * Prerequisites:
 * 1. Backend: docker compose -f /home/pleclech/xavyo-idp/docker/docker-compose.yml up -d
 * 2. Frontend: npm run dev -- --port 3000
 * 3. Chrome: google-chrome --remote-debugging-port=9222 --no-first-run --user-data-dir=/tmp/e2e-chrome
 */

import puppeteer from 'puppeteer-core';

const BASE_URL = 'http://localhost:3000';
const CHROME_URL = 'http://localhost:9222';
const TS = Date.now();
const TEST_EMAIL = `e2e-${TS}@test.local`;
const TEST_PASSWORD = 'TestPass@1234';
const TEST_DISPLAY_NAME = 'E2E Test User';
const TEST_ORG_NAME = `E2E Org ${TS}`;
const CREATED_USER_EMAIL = `user-${TS}@test.local`;
const ARCHETYPE_NAME = `E2E Archetype ${TS}`;
const TOOL_NAME = `E2E Tool ${TS}`;

let browser;
let page;
const results = [];

function log(status, test, detail = '') {
	const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
	const msg = `${icon} ${test}${detail ? ` — ${detail}` : ''}`;
	console.log(msg);
	results.push({ status, test, detail });
}

async function takeScreenshot(name) {
	try {
		await page.screenshot({ path: `/tmp/e2e-provision-${name}.png`, fullPage: true });
	} catch {
		// ignore screenshot errors
	}
}

/**
 * Clear a form field and type a new value.
 * Triple-click selects all existing text, then type() replaces it.
 */
async function typeInField(selector, value) {
	await page.waitForSelector(selector, { timeout: 5000 });
	await page.click(selector, { clickCount: 3 });
	await page.type(selector, value);
}

/** Wait for the page URL to exactly match the given path. */
async function waitForUrlPath(path, timeout = 15000) {
	await page.waitForFunction((p) => window.location.pathname === p, { timeout }, path);
}

/** Wait for the page URL to change away from the given path. */
async function waitForUrlChange(currentPath, timeout = 15000) {
	await page.waitForFunction((p) => window.location.pathname !== p, { timeout }, currentPath);
}

/** Wait for text to appear anywhere on the page. */
async function waitForText(text, timeout = 10000) {
	await page.waitForFunction(
		(t) => (document.body?.textContent ?? '').includes(t),
		{ timeout },
		text
	);
}

/** Click a <button> or [type="submit"] element whose text contains the given string. */
async function clickButtonByText(text) {
	const handle = await page.evaluateHandle((t) => {
		const buttons = [...document.querySelectorAll('button, [type="submit"]')];
		return buttons.find((b) => (b.textContent ?? '').trim().includes(t)) || null;
	}, text);
	const el = handle.asElement();
	if (!el) {
		await handle.dispose();
		throw new Error(`Button "${text}" not found`);
	}
	await el.click();
	await el.dispose();
}

/** Click an <a> element whose text contains the given string. */
async function clickLinkByText(text) {
	const handle = await page.evaluateHandle((t) => {
		const links = [...document.querySelectorAll('a')];
		return links.find((a) => (a.textContent ?? '').trim().includes(t)) || null;
	}, text);
	const el = handle.asElement();
	if (!el) {
		await handle.dispose();
		throw new Error(`Link "${text}" not found`);
	}
	await el.click();
	await el.dispose();
}

async function run() {
	console.log('🔄 Connecting to Chrome...');
	browser = await puppeteer.connect({
		browserURL: CHROME_URL,
		defaultViewport: { width: 1280, height: 800 }
	});

	page = await browser.newPage();
	await page.setViewport({ width: 1280, height: 800 });

	// Clear all cookies from previous runs to ensure clean state
	const cdpSession = await page.createCDPSession();
	await cdpSession.send('Network.clearBrowserCookies');
	await cdpSession.detach();
	console.log('🧹 Cleared all browser cookies');

	console.log(`📧 Test email: ${TEST_EMAIL}`);
	console.log(`🏢 Test org:   ${TEST_ORG_NAME}`);
	console.log(`👤 New user:   ${CREATED_USER_EMAIL}\n`);

	// ─── Test 1: Signup ───────────────────────────────────────────────
	try {
		await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle2', timeout: 15000 });
		await typeInField('input[name="email"]', TEST_EMAIL);
		await typeInField('input[name="password"]', TEST_PASSWORD);
		await typeInField('input[name="displayName"]', TEST_DISPLAY_NAME);
		await takeScreenshot('01-signup-filled');

		await clickButtonByText('Sign up');
		await waitForUrlPath('/onboarding');

		log('PASS', 'Signup', `Redirected to ${page.url()}`);
		await takeScreenshot('01-signup-done');
	} catch (e) {
		log('FAIL', 'Signup', e.message);
		await takeScreenshot('01-signup-error');
	}

	// ─── Test 2: Onboarding — provision tenant ────────────────────────
	let provisionedTenantId = '';
	try {
		await waitForText('Create your organization');
		await typeInField('input[name="organizationName"]', TEST_ORG_NAME);
		await takeScreenshot('02-onboarding-filled');

		await clickButtonByText('Create organization');
		await waitForText('Organization created', 20000);

		const credentials = await page.evaluate(() => {
			const text = document.body.textContent ?? '';
			const monoSpans = [...document.querySelectorAll('.font-mono')];
			return {
				tenantId: monoSpans[0]?.textContent?.trim() ?? '',
				tenantSlug: monoSpans[1]?.textContent?.trim() ?? '',
				hasApiKey: text.includes('Admin API Key'),
				hasClientId: text.includes('OAuth Client ID'),
				hasClientSecret: text.includes('OAuth Client Secret'),
				hasTenantInfo: text.includes('Tenant Information'),
				codeCount: document.querySelectorAll('code').length
			};
		});

		provisionedTenantId = credentials.tenantId;

		if (
			credentials.hasApiKey &&
			credentials.hasClientId &&
			credentials.hasClientSecret &&
			credentials.hasTenantInfo
		) {
			log(
				'PASS',
				'Onboarding — provision tenant',
				`Tenant: ${provisionedTenantId}, ${credentials.codeCount} credential fields`
			);
		} else {
			log(
				'WARN',
				'Onboarding — provision tenant',
				`Missing: apiKey=${credentials.hasApiKey} clientId=${credentials.hasClientId} clientSecret=${credentials.hasClientSecret}`
			);
		}
		await takeScreenshot('02-onboarding-done');
	} catch (e) {
		log('FAIL', 'Onboarding — provision tenant', e.message);
		await takeScreenshot('02-onboarding-error');
	}

	// ─── Test 3: Continue to dashboard ────────────────────────────────
	try {
		await clickLinkByText('Continue to dashboard');
		await waitForUrlPath('/dashboard');
		await waitForText('Welcome back');

		const emailVisible = await page.evaluate(
			(email) => (document.body.textContent ?? '').includes(email),
			TEST_EMAIL
		);
		const hasSidebar = await page.evaluate(() => {
			const text = document.body.textContent ?? '';
			return text.includes('Users') && text.includes('Personas') && text.includes('NHI');
		});

		if (emailVisible && hasSidebar) {
			log('PASS', 'Continue to dashboard', 'Email displayed, sidebar visible');
		} else {
			log('WARN', 'Continue to dashboard', `email=${emailVisible}, sidebar=${hasSidebar}`);
		}
		await takeScreenshot('03-dashboard');
	} catch (e) {
		log('FAIL', 'Continue to dashboard', e.message);
		await takeScreenshot('03-dashboard-error');
	}

	// ─── Test 4: Users list — page loads (admin user may exist) ─────────
	try {
		await page.goto(`${BASE_URL}/users`, { waitUntil: 'networkidle2', timeout: 15000 });
		const url = page.url();

		if (url.includes('/login')) {
			log('FAIL', 'Users list — page loads', 'Redirected to login');
		} else {
			// Wait for either the empty state or a data table
			await page.waitForFunction(
				() =>
					(document.body.textContent ?? '').includes('No users yet') ||
					document.querySelector('table tbody tr'),
				{ timeout: 10000 }
			);
			log('PASS', 'Users list — page loads', `Page loaded at ${url}`);
		}
		await takeScreenshot('04-users-list');
	} catch (e) {
		log('FAIL', 'Users list — page loads', e.message);
		await takeScreenshot('04-users-error');
	}

	// ─── Test 5: Create a user ────────────────────────────────────────
	try {
		await page.goto(`${BASE_URL}/users/create`, { waitUntil: 'networkidle2', timeout: 15000 });
		await waitForText('Create user');

		await typeInField('input[name="email"]', CREATED_USER_EMAIL);
		await typeInField('input[name="password"]', TEST_PASSWORD);
		// Check the "user" role checkbox
		await page.click('input[name="roles"][value="user"]');
		await takeScreenshot('05-user-create-filled');

		await clickButtonByText('Create user');
		await waitForUrlChange('/users/create');

		const finalUrl = page.url();
		if (finalUrl.includes('/users')) {
			log('PASS', 'Create a user', `Redirected to ${finalUrl}`);
		} else {
			log('WARN', 'Create a user', `Unexpected URL: ${finalUrl}`);
		}
		await takeScreenshot('05-user-created');
	} catch (e) {
		log('FAIL', 'Create a user', e.message);
		await takeScreenshot('05-user-error');
	}

	// ─── Test 6: Users list — with data ───────────────────────────────
	try {
		await page.goto(`${BASE_URL}/users`, { waitUntil: 'networkidle2', timeout: 15000 });
		// Wait for at least one table row
		await page.waitForFunction(() => document.querySelector('table tbody tr'), {
			timeout: 10000
		});

		const userVisible = await page.evaluate(
			(email) => (document.body.textContent ?? '').includes(email),
			CREATED_USER_EMAIL
		);

		if (userVisible) {
			log('PASS', 'Users list — with data', `${CREATED_USER_EMAIL} visible in table`);
		} else {
			log('WARN', 'Users list — with data', 'Table rendered but created user email not found');
		}
		await takeScreenshot('06-users-with-data');
	} catch (e) {
		log('FAIL', 'Users list — with data', e.message);
		await takeScreenshot('06-users-error');
	}

	// ─── Test 7: Personas archetypes — empty state ────────────────────
	try {
		await page.goto(`${BASE_URL}/personas/archetypes`, {
			waitUntil: 'networkidle2',
			timeout: 15000
		});
		await page.waitForFunction(
			() =>
				(document.body.textContent ?? '').includes('No archetypes yet') ||
				document.querySelector('table tbody tr'),
			{ timeout: 10000 }
		);
		const hasEmptyState = await page.evaluate(() =>
			(document.body.textContent ?? '').includes('No archetypes yet')
		);
		if (hasEmptyState) {
			log('PASS', 'Personas archetypes — empty state');
		} else {
			log('WARN', 'Personas archetypes — empty state', 'Table present (pre-existing data)');
		}
		await takeScreenshot('07-archetypes-empty');
	} catch (e) {
		log('FAIL', 'Personas archetypes — empty state', e.message);
		await takeScreenshot('07-archetypes-error');
	}

	// ─── Test 8: Create archetype ─────────────────────────────────────
	try {
		await page.goto(`${BASE_URL}/personas/archetypes/create`, {
			waitUntil: 'networkidle2',
			timeout: 15000
		});
		await waitForText('Create archetype');

		await typeInField('input[name="name"]', ARCHETYPE_NAME);
		await typeInField('input[name="naming_pattern"]', 'e2e.{username}');
		await typeInField('input[name="description"]', 'E2E test archetype');
		await takeScreenshot('08-archetype-create-filled');

		await clickButtonByText('Create archetype');
		await waitForUrlChange('/personas/archetypes/create');

		const finalUrl = page.url();
		if (finalUrl.includes('/personas/archetypes')) {
			log('PASS', 'Create archetype', `Redirected to ${finalUrl}`);
		} else {
			log('WARN', 'Create archetype', `Unexpected URL: ${finalUrl}`);
		}
		await takeScreenshot('08-archetype-created');
	} catch (e) {
		log('FAIL', 'Create archetype', e.message);
		await takeScreenshot('08-archetype-error');
	}

	// ─── Test 9: NHI list — empty state ───────────────────────────────
	try {
		await page.goto(`${BASE_URL}/nhi`, { waitUntil: 'networkidle2', timeout: 15000 });
		await page.waitForFunction(
			() =>
				(document.body.textContent ?? '').includes('No non-human identities yet') ||
				document.querySelector('table tbody tr'),
			{ timeout: 10000 }
		);
		const hasEmptyState = await page.evaluate(() =>
			(document.body.textContent ?? '').includes('No non-human identities yet')
		);
		if (hasEmptyState) {
			log('PASS', 'NHI list — empty state');
		} else {
			log('WARN', 'NHI list — empty state', 'Table present (pre-existing data)');
		}
		await takeScreenshot('09-nhi-empty');
	} catch (e) {
		log('FAIL', 'NHI list — empty state', e.message);
		await takeScreenshot('09-nhi-error');
	}

	// ─── Test 10: Create a Tool (NHI) ─────────────────────────────────
	try {
		await page.goto(`${BASE_URL}/nhi/tools/create`, {
			waitUntil: 'networkidle2',
			timeout: 15000
		});
		await waitForText('Create tool');

		await typeInField('input[name="name"]', TOOL_NAME);
		await typeInField('input[name="description"]', 'E2E test tool');
		// input_schema is required — fill the textarea with valid JSON
		const schemaSelector = 'textarea[name="input_schema"]';
		await page.waitForSelector(schemaSelector, { timeout: 5000 });
		await page.click(schemaSelector, { clickCount: 3 });
		await page.type(schemaSelector, '{"type": "object", "properties": {}}');
		await takeScreenshot('10-tool-create-filled');

		await clickButtonByText('Create tool');
		await waitForUrlChange('/nhi/tools/create');

		const finalUrl = page.url();
		if (finalUrl.includes('/nhi')) {
			log('PASS', 'Create a Tool (NHI)', `Redirected to ${finalUrl}`);
		} else {
			log('WARN', 'Create a Tool (NHI)', `Unexpected URL: ${finalUrl}`);
		}
		await takeScreenshot('10-tool-created');
	} catch (e) {
		log('FAIL', 'Create a Tool (NHI)', e.message);
		await takeScreenshot('10-tool-error');
	}

	// ─── Test 11: Logout and re-login ─────────────────────────────────
	try {
		// Clear auth cookies but preserve tenant_id (needed for login)
		const cookies = await page.cookies(BASE_URL);
		for (const cookie of cookies) {
			if (cookie.name === 'access_token' || cookie.name === 'refresh_token') {
				await page.deleteCookie(cookie);
			}
		}

		// Navigate to dashboard — should redirect to login
		await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2', timeout: 15000 });
		const loginUrl = page.url();
		if (!loginUrl.includes('/login')) {
			throw new Error(`Expected /login redirect, got ${loginUrl}`);
		}

		// Log back in with the same credentials
		await typeInField('input[name="email"]', TEST_EMAIL);
		await typeInField('input[name="password"]', TEST_PASSWORD);
		await takeScreenshot('11-login-filled');

		await clickButtonByText('Log in');
		await waitForUrlPath('/dashboard', 15000);
		await waitForText('Welcome back');

		const emailVisible = await page.evaluate(
			(email) => (document.body.textContent ?? '').includes(email),
			TEST_EMAIL
		);

		if (emailVisible) {
			log('PASS', 'Logout and re-login', 'Redirected to login, re-login successful');
		} else {
			log('WARN', 'Logout and re-login', 'Dashboard loaded but email not visible');
		}
		await takeScreenshot('11-relogin-done');
	} catch (e) {
		log('FAIL', 'Logout and re-login', e.message);
		await takeScreenshot('11-relogin-error');
	}

	// ─── Test 12: Verify HttpOnly cookies (security) ──────────────────
	try {
		const jsAccessibleCookies = await page.evaluate(() => document.cookie);
		const hasAccessToken = jsAccessibleCookies.includes('access_token');
		const hasRefreshToken = jsAccessibleCookies.includes('refresh_token');

		if (!hasAccessToken && !hasRefreshToken) {
			log('PASS', 'Verify HttpOnly cookies', 'No auth tokens in document.cookie');
		} else {
			log(
				'FAIL',
				'Verify HttpOnly cookies',
				`Tokens visible: access_token=${hasAccessToken} refresh_token=${hasRefreshToken}`
			);
		}
	} catch (e) {
		log('FAIL', 'Verify HttpOnly cookies', e.message);
	}

	// ─── Summary ──────────────────────────────────────────────────────
	console.log('\n' + '═'.repeat(60));
	const passed = results.filter((r) => r.status === 'PASS').length;
	const failed = results.filter((r) => r.status === 'FAIL').length;
	const warned = results.filter((r) => r.status === 'WARN').length;
	console.log(
		`📊 Results: ${passed} passed, ${failed} failed, ${warned} warnings (${results.length} total)`
	);
	console.log('═'.repeat(60));

	await page.close();
	browser.disconnect();

	process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
	console.error('💥 Fatal error:', e.message);
	process.exit(1);
});
