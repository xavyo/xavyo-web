import { afterEach } from 'vitest';

// Flush pending microtasks and 0ms timers after each test so async continuations
// complete while jsdom's `document` still exists.
//
// Several dialogs await an async callback (e.g. `await onDecide(...)`) and then set
// `open = false`, which closes a portal-based bits-ui dialog that touches
// `document.body` during teardown. Under full-suite timing that continuation can
// otherwise fire after the test file's jsdom environment has been torn down,
// producing a flaky "ReferenceError: document is not defined" unhandled error that
// fails the run even though every test passes. Draining pending work here keeps
// those callbacks inside the live environment.
afterEach(async () => {
	await new Promise((resolve) => setTimeout(resolve, 0));
});
