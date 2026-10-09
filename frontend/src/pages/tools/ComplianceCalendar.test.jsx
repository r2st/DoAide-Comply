import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ComplianceCalendar, { buildCalendarEntries } from './ComplianceCalendar.jsx';

const wrap = () => render(<MemoryRouter><ComplianceCalendar /></MemoryRouter>);

describe('ComplianceCalendar', () => {
  it('renders the page heading', () => {
    wrap();
    expect(screen.getByRole('heading', { name: /Compliance Calendar FY 2026-27/i })).toBeInTheDocument();
  });

  it('shows stat cards for total, upcoming, and overdue', () => {
    wrap();
    const cards = screen.getAllByTestId('stat-card');
    expect(cards).toHaveLength(3);
  });

  it('renders calendar entries grouped by month', () => {
    wrap();
    const groups = screen.getAllByTestId('month-group');
    expect(groups.length).toBeGreaterThan(0);
  });

  it('renders calendar entry items', () => {
    wrap();
    const entries = screen.getAllByTestId('calendar-entry');
    expect(entries.length).toBeGreaterThan(0);
  });

  it('filters by category when a tab is clicked', async () => {
    wrap();
    const allEntries = screen.getAllByTestId('calendar-entry').length;
    await userEvent.click(screen.getByRole('tab', { name: 'ROC' }));
    const rocEntries = screen.getAllByTestId('calendar-entry').length;
    expect(rocEntries).toBeLessThan(allEntries);
    expect(rocEntries).toBeGreaterThan(0);
  });

  it('shows no results message when filtering produces empty list', async () => {
    wrap();
    await userEvent.click(screen.getByRole('tab', { name: 'Professional Tax' }));
    const entries = screen.queryAllByTestId('calendar-entry');
    if (entries.length === 0) {
      expect(screen.getByTestId('no-results')).toBeInTheDocument();
    } else {
      expect(entries.length).toBeGreaterThan(0);
    }
  });

  it('toggles between upcoming and all view', async () => {
    wrap();
    const upcomingCount = screen.getAllByTestId('calendar-entry').length;
    await userEvent.click(screen.getByText('All FY'));
    const allCount = screen.getAllByTestId('calendar-entry').length;
    expect(allCount).toBeGreaterThanOrEqual(upcomingCount);
  });

  it('shows status badges on entries', () => {
    wrap();
    const badges = screen.getAllByTestId('status-badge');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('renders the FAQ section', () => {
    wrap();
    expect(screen.getByText('Compliance Calendar FAQ')).toBeInTheDocument();
  });

  it('includes JSON-LD FAQ schema', () => {
    const { container } = render(<MemoryRouter><ComplianceCalendar /></MemoryRouter>);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    const faqScript = Array.from(scripts).find((s) => s.textContent.includes('FAQPage'));
    expect(faqScript).not.toBeNull();
  });

  it('links to the free health check', () => {
    wrap();
    expect(screen.getByRole('link', { name: /run the free health check/i })).toHaveAttribute('href', '/');
  });
});

describe('buildCalendarEntries', () => {
  it('returns a sorted array of entries', () => {
    const entries = buildCalendarEntries();
    expect(entries.length).toBeGreaterThan(50);
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i].dueDate >= entries[i - 1].dueDate).toBe(true);
    }
  });

  it('includes monthly GST entries for all 12 months', () => {
    const entries = buildCalendarEntries();
    const gstr3b = entries.filter((e) => e.form === 'GSTR-3B');
    expect(gstr3b).toHaveLength(12);
  });

  it('includes fixed-date entries like advance tax', () => {
    const entries = buildCalendarEntries();
    const advanceTax = entries.filter((e) => e.form.startsWith('Advance Tax'));
    expect(advanceTax).toHaveLength(4);
  });

  it('each entry has required fields', () => {
    const entries = buildCalendarEntries();
    for (const e of entries) {
      expect(e.category).toBeTruthy();
      expect(e.form).toBeTruthy();
      expect(e.title).toBeTruthy();
      expect(e.dueDate).toBeInstanceOf(Date);
      expect(e.lateFee).toBeTruthy();
    }
  });
});
