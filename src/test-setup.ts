import { afterEach, afterAll } from 'vitest';

// Drain pending async work so portal/dialog teardown completes while jsdom's
// `document` still exists.
//
// bits-ui dialogs schedule teardown asynchronously when they close/unmount:
//   - `animations-complete` queues a `requestAnimationFrame`, and
//   - `body-scroll-lock` schedules a ~24ms `setTimeout` whose callback touches
//     `document.body` to restore styles.
// Under full-suite timing, a continuation scheduled by the *last* test in a file
// can otherwise fire after that file's jsdom environment has been torn down,
// producing a flaky "ReferenceError: document is not defined" unhandled error
// that fails the whole run even though every test passes.

// After each test: a cheap drain (microtask + one animation frame + a 0ms timer)
// so most continuations run promptly while the document is alive.
afterEach(async () => {
	await Promise.resolve();
	if (typeof requestAnimationFrame === 'function') {
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
	}
	await new Promise<void>((resolve) => setTimeout(resolve, 0));
});

// After each test file, before jsdom is disposed: wait long enough for bits-ui's
// deferred body-scroll-lock cleanup (~24ms) and any queued animation frame to run
// while `document` still exists. Runs once per file, so the cost is negligible.
afterAll(async () => {
	if (typeof requestAnimationFrame === 'function') {
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
	}
	await new Promise<void>((resolve) => setTimeout(resolve, 50));
});
