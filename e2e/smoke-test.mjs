#!/usr/bin/env node
/**
 * E2E Smoke Test for xavyo-web
 * Connects to Chrome via CDP and tests key pages/features.
 * Requires: Chrome running with --remote-debugging-port=9222
 *           Dev server running on localhost:3000
 */

import puppeteer from 'puppeteer-core';

const BASE_URL = 'http://localhost:3000';
const CHROME_URL = 'http://localhost:9222';

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
		await page.screenshot({ path: `/tmp/e2e-${name}.png`, fullPage: true });
	} catch {
		// ignore screenshot errors
	}
}

async function run() {
	console.log('🔄 Connecting to Chrome...');
	browser = await puppeteer.connect({
		browserURL: CHROME_URL,
		defaultViewport: { width: 1280, height: 800 }
	});

	page = await browser.newPage();
	await page.setViewport({ width: 1280, height: 800 });

	// ─── Test 1: Login page renders ───
	try {
		await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 10000 });
		const title = await page.$eval('h1, h2, [class*="card-title"]', el => el.textContent);
		if (title && title.toLowerCase().includes('sign in')) {
			log('PASS', 'Login page renders', `Title: "${title.trim()}"`);
		} else if (title) {
			log('PASS', 'Login page renders', `Title found: "${title.trim()}"`);
		} else {
			log('FAIL', 'Login page renders', 'No title found');
		}
		await takeScreenshot('01-login');

		// Check form fields
		const emailInput = await page.$('input[name="email"], input[type="email"]');
		const passwordInput = await page.$('input[name="password"], input[type="password"]');
		if (emailInput && passwordInput) {
			log('PASS', 'Login form has email and password fields');
		} else {
			log('FAIL', 'Login form fields', `email: ${!!emailInput}, password: ${!!passwordInput}`);
		}
	} catch (e) {
		log('FAIL', 'Login page renders', e.message);
	}

	// ─── Test 2: Signup page renders ───
	try {
		await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle2', timeout: 10000 });
		const hasForm = await page.$('form');
		if (hasForm) {
			log('PASS', 'Signup page renders with form');
		} else {
			log('FAIL', 'Signup page renders', 'No form found');
		}
		await takeScreenshot('02-signup');
	} catch (e) {
		log('FAIL', 'Signup page renders', e.message);
	}

	// ─── Test 3: Forgot password page renders ───
	try {
		await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle2', timeout: 10000 });
		const hasForm = await page.$('form');
		if (hasForm) {
			log('PASS', 'Forgot password page renders');
		} else {
			log('FAIL', 'Forgot password page renders', 'No form found');
		}
		await takeScreenshot('03-forgot-password');
	} catch (e) {
		log('FAIL', 'Forgot password page renders', e.message);
	}

	// ─── Test 4: Unauthenticated access redirects to login ───
	try {
		await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2', timeout: 10000 });
		const url = page.url();
		if (url.includes('/login')) {
			log('PASS', 'Auth guard redirects to login', `URL: ${url}`);
		} else {
			log('WARN', 'Auth guard redirect', `URL: ${url} (expected /login redirect)`);
		}
		await takeScreenshot('04-auth-guard');
	} catch (e) {
		log('FAIL', 'Auth guard redirect', e.message);
	}

	// ─── Test 5: Users list redirects to login when unauthenticated ───
	try {
		await page.goto(`${BASE_URL}/users`, { waitUntil: 'networkidle2', timeout: 10000 });
		const url = page.url();
		if (url.includes('/login')) {
			log('PASS', 'Users page auth guard', `Redirected to: ${url}`);
		} else {
			log('WARN', 'Users page auth guard', `URL: ${url}`);
		}
	} catch (e) {
		log('FAIL', 'Users page auth guard', e.message);
	}

	// ─── Test 6: Personas list redirects to login ───
	try {
		await page.goto(`${BASE_URL}/personas`, { waitUntil: 'networkidle2', timeout: 10000 });
		const url = page.url();
		if (url.includes('/login')) {
			log('PASS', 'Personas page auth guard', `Redirected to: ${url}`);
		} else {
			log('WARN', 'Personas page auth guard', `URL: ${url}`);
		}
	} catch (e) {
		log('FAIL', 'Personas page auth guard', e.message);
	}

	// ─── Test 7: NHI list redirects to login ───
	try {
		await page.goto(`${BASE_URL}/nhi`, { waitUntil: 'networkidle2', timeout: 10000 });
		const url = page.url();
		if (url.includes('/login')) {
			log('PASS', 'NHI page auth guard', `Redirected to: ${url}`);
		} else {
			log('WARN', 'NHI page auth guard', `URL: ${url}`);
		}
	} catch (e) {
		log('FAIL', 'NHI page auth guard', e.message);
	}

	// ─── Test 8: Verify email page renders ───
	try {
		await page.goto(`${BASE_URL}/verify-email?token=test`, { waitUntil: 'networkidle2', timeout: 10000 });
		const url = page.url();
		if (url.includes('verify-email')) {
			log('PASS', 'Verify email page renders');
		} else {
			log('WARN', 'Verify email page', `Redirected to: ${url}`);
		}
		await takeScreenshot('08-verify-email');
	} catch (e) {
		log('FAIL', 'Verify email page renders', e.message);
	}

	// ─── Test 9: Reset password page renders ───
	try {
		await page.goto(`${BASE_URL}/reset-password?token=test`, { waitUntil: 'networkidle2', timeout: 10000 });
		const url = page.url();
		if (url.includes('reset-password')) {
			log('PASS', 'Reset password page renders');
		} else {
			log('WARN', 'Reset password page', `Redirected to: ${url}`);
		}
		await takeScreenshot('09-reset-password');
	} catch (e) {
		log('FAIL', 'Reset password page renders', e.message);
	}

	// ─── Test 10: Login page responsive (mobile viewport) ───
	try {
		await page.setViewport({ width: 375, height: 812 });
		await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 10000 });
		const hasForm = await page.$('form');
		if (hasForm) {
			log('PASS', 'Login page renders on mobile (375px)');
		} else {
			log('FAIL', 'Login mobile rendering', 'No form found');
		}
		await takeScreenshot('10-login-mobile');
		await page.setViewport({ width: 1280, height: 800 });
	} catch (e) {
		log('FAIL', 'Login mobile rendering', e.message);
		await page.setViewport({ width: 1280, height: 800 });
	}

	// ─── Test 11: Check no console errors on login page ───
	try {
		const consoleErrors = [];
		page.on('console', msg => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});
		await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 10000 });
		await new Promise(r => setTimeout(r, 1000));
		if (consoleErrors.length === 0) {
			log('PASS', 'No console errors on login page');
		} else {
			log('WARN', 'Console errors on login', consoleErrors.join('; '));
		}
	} catch (e) {
		log('FAIL', 'Console error check', e.message);
	}

	// ─── Test 12: Error page renders for invalid route ───
	try {
		await page.goto(`${BASE_URL}/this-route-does-not-exist-xyz`, { waitUntil: 'networkidle2', timeout: 10000 });
		const text = await page.evaluate(() => document.body.textContent);
		if (text && (text.includes('Something went wrong') || text.includes('Not Found') || text.includes('Error'))) {
			log('PASS', 'Error page renders for 404', 'Shows error message');
		} else {
			log('WARN', 'Error page for 404', `Body text: "${text?.substring(0, 100)}"`);
		}
		await takeScreenshot('12-error-page');
	} catch (e) {
		log('FAIL', 'Error page for 404', e.message);
	}

	// ─── Summary ───
	console.log('\n' + '═'.repeat(60));
	const passed = results.filter(r => r.status === 'PASS').length;
	const failed = results.filter(r => r.status === 'FAIL').length;
	const warned = results.filter(r => r.status === 'WARN').length;
	console.log(`📊 Results: ${passed} passed, ${failed} failed, ${warned} warnings (${results.length} total)`);
	console.log('═'.repeat(60));

	await page.close();
	browser.disconnect();

	process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => {
	console.error('💥 Fatal error:', e.message);
	process.exit(1);
});
