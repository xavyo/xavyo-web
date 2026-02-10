import { describe, it, expect } from 'vitest';
import * as DropdownMenu from './index';

describe('DropdownMenu', () => {
  it('exports all sub-components', () => {
    expect(DropdownMenu.Root).toBeDefined();
    expect(DropdownMenu.Trigger).toBeDefined();
    expect(DropdownMenu.Content).toBeDefined();
    expect(DropdownMenu.Item).toBeDefined();
    expect(DropdownMenu.Separator).toBeDefined();
    expect(DropdownMenu.Label).toBeDefined();
    expect(DropdownMenu.Group).toBeDefined();
  });
});
