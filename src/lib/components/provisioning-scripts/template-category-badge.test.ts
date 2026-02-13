import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import TemplateCategoryBadge from './template-category-badge.svelte';

describe('TemplateCategoryBadge', () => {
	afterEach(cleanup);

	it('renders "Attribute Mapping" for attribute_mapping category', () => {
		render(TemplateCategoryBadge, { props: { category: 'attribute_mapping' } });
		expect(screen.getByText('Attribute Mapping')).toBeTruthy();
	});

	it('renders "Value Generation" for value_generation category', () => {
		render(TemplateCategoryBadge, { props: { category: 'value_generation' } });
		expect(screen.getByText('Value Generation')).toBeTruthy();
	});

	it('renders "Conditional Logic" for conditional_logic category', () => {
		render(TemplateCategoryBadge, { props: { category: 'conditional_logic' } });
		expect(screen.getByText('Conditional Logic')).toBeTruthy();
	});

	it('renders "Data Formatting" for data_formatting category', () => {
		render(TemplateCategoryBadge, { props: { category: 'data_formatting' } });
		expect(screen.getByText('Data Formatting')).toBeTruthy();
	});

	it('renders "Custom" for custom category', () => {
		render(TemplateCategoryBadge, { props: { category: 'custom' } });
		expect(screen.getByText('Custom')).toBeTruthy();
	});

	it('renders raw category value for unknown category', () => {
		render(TemplateCategoryBadge, { props: { category: 'some_new_category' } });
		expect(screen.getByText('some_new_category')).toBeTruthy();
	});
});
