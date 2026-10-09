import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FeedbackWidget from './FeedbackWidget.jsx';

describe('FeedbackWidget', () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () => ({ ok: true, status: 201, json: async () => ({ status: 'received' }) }));
  });
  afterEach(() => vi.restoreAllMocks());

  it('opens modal on button click', async () => {
    render(<FeedbackWidget />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /send feedback/i }));
    expect(screen.getByRole('dialog', { name: /feedback form/i })).toBeInTheDocument();
  });

  it('submits feedback and shows confirmation', async () => {
    render(<FeedbackWidget />);
    await userEvent.click(screen.getByRole('button', { name: /send feedback/i }));
    await userEvent.click(screen.getByRole('button', { name: /bug/i }));
    await userEvent.type(screen.getByPlaceholderText(/tell us/i), 'Something broke');
    await userEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => expect(screen.getByRole('button', { name: /sent/i })).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalledWith('/api/feedback', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ type: 'bug', message: 'Something broke' }),
    }));
  });

  it('shows error on failure', async () => {
    global.fetch = vi.fn(async () => ({ ok: false, status: 500 }));
    render(<FeedbackWidget />);
    await userEvent.click(screen.getByRole('button', { name: /send feedback/i }));
    await userEvent.type(screen.getByPlaceholderText(/tell us/i), 'Oops');
    await userEvent.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => expect(screen.getByText(/failed to send/i)).toBeInTheDocument());
  });

  it('closes modal on cancel', async () => {
    render(<FeedbackWidget />);
    await userEvent.click(screen.getByRole('button', { name: /send feedback/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
