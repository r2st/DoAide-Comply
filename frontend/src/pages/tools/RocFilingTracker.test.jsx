import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, beforeEach } from 'vitest';
import RocFilingTracker, { computeDeadlines } from './RocFilingTracker.jsx';

const wrap = () => render(<MemoryRouter><RocFilingTracker /></MemoryRouter>);

describe('RocFilingTracker', () => {
  it('renders the page heading', () => {
    wrap();
    expect(screen.getByRole('heading', { name: /ROC Filing Deadline Tracker/i })).toBeInTheDocument();
  });

  it('renders the input form with three date fields', () => {
    wrap();
    expect(screen.getByLabelText(/incorporation date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last agm date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/financial year end/i)).toBeInTheDocument();
  });

  it('does not show deadlines before form submission', () => {
    wrap();
    expect(screen.queryByTestId('filing-item')).not.toBeInTheDocument();
  });

  it('shows filing items after submitting the form', async () => {
    wrap();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/incorporation date/i), '2024-01-15');
    await user.type(screen.getByLabelText(/last agm date/i), '2026-09-30');
    await user.click(screen.getByRole('button', { name: /calculate deadlines/i }));
    const items = screen.getAllByTestId('filing-item');
    expect(items.length).toBe(9);
  });

  it('shows summary cards after calculation', async () => {
    wrap();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/last agm date/i), '2026-09-30');
    await user.click(screen.getByRole('button', { name: /calculate deadlines/i }));
    const cards = screen.getAllByTestId('summary-card');
    expect(cards.length).toBe(3);
  });

  it('shows penalty info for each filing', async () => {
    wrap();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/last agm date/i), '2026-09-30');
    await user.click(screen.getByRole('button', { name: /calculate deadlines/i }));
    const items = screen.getAllByTestId('filing-item');
    for (const item of items) {
      const summary = within(item).getByText(/penalty for late filing/i);
      expect(summary).toBeInTheDocument();
    }
  });

  it('renders the FAQ section with 7 questions', () => {
    wrap();
    const faqSection = screen.getByText('ROC Filing FAQ');
    expect(faqSection).toBeInTheDocument();
    const questions = screen.getAllByText(/\?$/);
    expect(questions.length).toBeGreaterThanOrEqual(7);
  });

  it('renders JSON-LD FAQ schema', () => {
    const { container } = render(<MemoryRouter><RocFilingTracker /></MemoryRouter>);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script.textContent);
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity.length).toBeGreaterThanOrEqual(5);
  });

  it('renders share buttons after calculation', async () => {
    wrap();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/last agm date/i), '2026-09-30');
    await user.click(screen.getByRole('button', { name: /calculate deadlines/i }));
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
  });

  it('links to the free health check', () => {
    wrap();
    expect(screen.getByRole('link', { name: /run the free health check/i })).toHaveAttribute('href', '/');
  });
});

describe('computeDeadlines', () => {
  const today = new Date(2026, 9, 9); // Oct 9, 2026

  it('calculates AGM-based deadlines correctly', () => {
    const results = computeDeadlines('2020-01-01', '2026-09-30', '2026-03-31', new Date(today));
    const aoc4 = results.find((r) => r.form === 'AOC-4');
    expect(aoc4.dueDate).toEqual(new Date(2026, 9, 30)); // Sep 30 + 30 days = Oct 30
    expect(aoc4.daysRemaining).toBe(21);
    expect(aoc4.status).toBe('upcoming');
  });

  it('marks overdue filings as overdue', () => {
    const results = computeDeadlines('2020-01-01', '2026-08-01', '2026-03-31', new Date(today));
    const adt1 = results.find((r) => r.form === 'ADT-1');
    // Aug 1 + 15 = Aug 16, which is before Oct 9
    expect(adt1.status).toBe('overdue');
    expect(adt1.daysRemaining).toBeLessThan(0);
  });

  it('marks safe filings correctly', () => {
    const results = computeDeadlines('2020-01-01', '2026-10-01', '2026-03-31', new Date(today));
    const mgt7 = results.find((r) => r.form === 'MGT-7');
    // Oct 1 + 60 = Nov 30, which is 52 days from Oct 9
    expect(mgt7.status).toBe('safe');
    expect(mgt7.daysRemaining).toBeGreaterThan(30);
  });

  it('calculates incorporation-based deadline (INC-20A)', () => {
    const results = computeDeadlines('2026-06-01', '2026-09-30', '2026-03-31', new Date(today));
    const inc20a = results.find((r) => r.form === 'INC-20A');
    // Jun 1 + 180 = Nov 28
    expect(inc20a.dueDate).toEqual(new Date(2026, 10, 28));
    expect(inc20a.status).toBe('safe');
  });

  it('handles missing AGM date gracefully', () => {
    const results = computeDeadlines('2020-01-01', '', '2026-03-31', new Date(today));
    const aoc4 = results.find((r) => r.form === 'AOC-4');
    expect(aoc4.calculable).toBe(false);
    expect(aoc4.status).toBe('unknown');
  });

  it('calculates fixed-date deadlines (DIR-3 KYC on Sep 30)', () => {
    const ref = new Date(2026, 5, 15); // Jun 15, 2026
    const results = computeDeadlines('2020-01-01', '2026-04-01', '2026-03-31', ref);
    const dir3 = results.find((r) => r.form === 'DIR-3 KYC');
    expect(dir3.dueDate).toEqual(new Date(2026, 8, 30));
    expect(dir3.status).toBe('safe');
  });

  it('rolls fixed date to next year if already passed', () => {
    const ref = new Date(2026, 9, 15); // Oct 15, 2026 — after Sep 30
    const results = computeDeadlines('2020-01-01', '2026-09-01', '2026-03-31', ref);
    const dir3 = results.find((r) => r.form === 'DIR-3 KYC');
    expect(dir3.dueDate.getFullYear()).toBe(2027);
  });

  it('marks BEN-2 as event-based and not calculable', () => {
    const results = computeDeadlines('2020-01-01', '2026-09-30', '2026-03-31', new Date(today));
    const ben2 = results.find((r) => r.form === 'BEN-2');
    expect(ben2.calculable).toBe(false);
    expect(ben2.status).toBe('unknown');
  });

  it('returns all 9 filings', () => {
    const results = computeDeadlines('2020-01-01', '2026-09-30', '2026-03-31', new Date(today));
    expect(results.length).toBe(9);
  });
});
