import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import IndustryChecklist, { INDUSTRIES } from './IndustryChecklist.jsx';

const wrap = (route = '/tools/industry-checklist') =>
  render(<MemoryRouter initialEntries={[route]}><IndustryChecklist /></MemoryRouter>);

describe('IndustryChecklist', () => {
  it('renders the page heading', () => {
    wrap();
    expect(screen.getByRole('heading', { name: /Industry Compliance Checklist/i })).toBeInTheDocument();
  });

  it('renders the industry selector with all 4 industries', () => {
    wrap();
    const select = screen.getByLabelText(/select your industry/i);
    expect(select).toBeInTheDocument();
    expect(select.querySelectorAll('option')).toHaveLength(4);
  });

  it('shows checklist items for the default industry (manufacturing)', () => {
    wrap();
    const items = screen.getAllByTestId('checklist-item');
    expect(items.length).toBe(INDUSTRIES.manufacturing.items.length);
  });

  it('switches industry and updates checklist', async () => {
    wrap();
    const select = screen.getByLabelText(/select your industry/i);
    await userEvent.selectOptions(select, 'it_services');
    const items = screen.getAllByTestId('checklist-item');
    expect(items.length).toBe(INDUSTRIES.it_services.items.length);
  });

  it('filters by compliance area', async () => {
    wrap();
    const allCount = screen.getAllByTestId('checklist-item').length;
    await userEvent.click(screen.getByRole('tab', { name: 'GST' }));
    const gstCount = screen.getAllByTestId('checklist-item').length;
    expect(gstCount).toBeLessThan(allCount);
    expect(gstCount).toBeGreaterThan(0);
  });

  it('shows area stats cards', () => {
    wrap();
    const stats = screen.getAllByTestId('area-stat');
    expect(stats.length).toBeGreaterThan(0);
    expect(stats.length).toBeLessThanOrEqual(4);
  });

  it('each checklist item shows area, task, frequency, and penalty', () => {
    wrap();
    const items = screen.getAllByTestId('checklist-item');
    const first = items[0];
    expect(first.textContent).toContain('Penalty:');
  });

  it('renders share buttons', () => {
    wrap();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
  });

  it('links to the free health check', () => {
    wrap();
    expect(screen.getByRole('link', { name: /run the free health check/i })).toHaveAttribute('href', '/');
  });

  it('respects industry query parameter', () => {
    wrap('/tools/industry-checklist?industry=healthcare');
    const items = screen.getAllByTestId('checklist-item');
    expect(items.length).toBe(INDUSTRIES.healthcare.items.length);
  });

  it('all industries have at least 15 checklist items', () => {
    for (const [key, industry] of Object.entries(INDUSTRIES)) {
      expect(industry.items.length).toBeGreaterThanOrEqual(15);
    }
  });

  it('all industries have name and description', () => {
    for (const [key, industry] of Object.entries(INDUSTRIES)) {
      expect(industry.name).toBeTruthy();
      expect(industry.description).toBeTruthy();
    }
  });
});
