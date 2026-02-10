import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import * as Dialog from './index';

describe('Dialog', () => {
  it('exports all sub-components', () => {
    expect(Dialog.Root).toBeDefined();
    expect(Dialog.Trigger).toBeDefined();
    expect(Dialog.Content).toBeDefined();
    expect(Dialog.Header).toBeDefined();
    expect(Dialog.Footer).toBeDefined();
    expect(Dialog.Title).toBeDefined();
    expect(Dialog.Description).toBeDefined();
    expect(Dialog.Overlay).toBeDefined();
    expect(Dialog.Close).toBeDefined();
  });
});
