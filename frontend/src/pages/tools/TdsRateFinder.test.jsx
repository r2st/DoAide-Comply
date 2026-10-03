import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import TdsRateFinder from './TdsRateFinder.jsx';

const wrap = () => render(<MemoryRouter><TdsRateFinder /></MemoryRouter>);

describe('TdsRateFinder', () => {
  it('renders the table with all TDS sections', () => {
    wrap();
    const rows = screen.getAllByTestId('tds-row');
    expect(rows.length).toBeGreaterThanOrEqual(15);
  });

  it('filters by section number', async () => {
    wrap();
    await userEvent.type(screen.getByLabelText(/search/i), '194C');
    const rows = screen.getAllByTestId('tds-row');
    expect(rows.length).toBeLessThan(20);
    expect(rows.some((r) => r.textContent.includes('194C'))).toBe(true);
  });

  it('filters by payment type', async () => {
    wrap();
    await userEvent.type(screen.getByLabelText(/search/i), 'contractor');
    const rows = screen.getAllByTestId('tds-row');
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0].textContent).toContain('Contractor');
  });

  it('shows correct rate for Section 194A', () => {
    wrap();
    const row194A = screen.getAllByTestId('tds-row').find((r) => r.textContent.includes('194A'));
    expect(row194A.textContent).toContain('10%');
  });

  it('shows no-results message for gibberish search', async () => {
    wrap();
    await userEvent.type(screen.getByLabelText(/search/i), 'zzzzzzz');
    expect(screen.getByText(/no matching sections/i)).toBeInTheDocument();
  });
});
