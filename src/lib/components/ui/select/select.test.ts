import { describe, it, expect } from 'vitest';
import * as Select from './index';

describe('Select', () => {
  it('exports all sub-components', () => {
    expect(Select.Root).toBeDefined();
    expect(Select.Trigger).toBeDefined();
    expect(Select.Content).toBeDefined();
    expect(Select.Item).toBeDefined();
    expect(Select.Group).toBeDefined();
    expect(Select.GroupHeading).toBeDefined();
    expect(Select.Viewport).toBeDefined();
  });
});
