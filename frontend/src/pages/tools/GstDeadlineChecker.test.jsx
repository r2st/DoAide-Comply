import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import GstDeadlineChecker from './GstDeadlineChecker.jsx';

const wrap = () => render(<MemoryRouter><GstDeadlineChecker /></MemoryRouter>);

describe('GstDeadlineChecker', () => {
  it('renders the page heading', () => {
    wrap();
    expect(screen.getByRole('heading', { name: /GST Deadline Checker/i })).toBeInTheDocument();
  });

  it('shows monthly deadlines by default', () => {
    wrap();
    const items = screen.getAllByTestId('deadline-item');
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/GSTR-1/)).toBeInTheDocument();
    expect(screen.getByText(/GSTR-3B/)).toBeInTheDocument();
  });

  it('switches to quarterly frequency', async () => {
    wrap();
    await userEvent.selectOptions(screen.getByLabelText(/filing frequency/i), 'quarterly');
    expect(screen.queryByText('GSTR-1')).not.toBeInTheDocument();
  });

  it('shows late fee information', () => {
    wrap();
    const fees = screen.getAllByTestId('late-fee');
    expect(fees.length).toBeGreaterThan(0);
    expect(fees[0].textContent).toContain('₹');
  });

  it('shows annual deadlines section', () => {
    wrap();
    expect(screen.getByText('GSTR-9')).toBeInTheDocument();
    expect(screen.getAllByTestId('annual-item').length).toBe(3);
  });
});
