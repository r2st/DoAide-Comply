import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ComplianceScore from './ComplianceScore.jsx';

const wrap = () => render(<MemoryRouter><ComplianceScore /></MemoryRouter>);

describe('ComplianceScore', () => {
  it('renders all 10 questions', () => {
    wrap();
    expect(screen.getAllByTestId('question')).toHaveLength(10);
  });

  it('disables submit until all questions answered', () => {
    wrap();
    expect(screen.getByRole('button', { name: /get my score/i })).toBeDisabled();
  });

  it('scores 100/100 when all answers are yes', async () => {
    wrap();
    const yesButtons = screen.getAllByRole('button', { name: 'Yes' });
    for (const btn of yesButtons) await userEvent.click(btn);
    await userEvent.click(screen.getByRole('button', { name: /get my score/i }));
    expect(screen.getByTestId('score')).toHaveTextContent('100/100');
    expect(screen.getByTestId('grade')).toHaveTextContent('Excellent');
  });

  it('scores 0/100 when all answers are no and shows At Risk', async () => {
    wrap();
    const noButtons = screen.getAllByRole('button', { name: 'No' });
    for (const btn of noButtons) await userEvent.click(btn);
    await userEvent.click(screen.getByRole('button', { name: /get my score/i }));
    expect(screen.getByTestId('score')).toHaveTextContent('0/100');
    expect(screen.getByTestId('grade')).toHaveTextContent('At Risk');
  });

  it('allows retaking the quiz', async () => {
    wrap();
    const yesButtons = screen.getAllByRole('button', { name: 'Yes' });
    for (const btn of yesButtons) await userEvent.click(btn);
    await userEvent.click(screen.getByRole('button', { name: /get my score/i }));
    await userEvent.click(screen.getByRole('button', { name: /retake/i }));
    expect(screen.getAllByTestId('question')).toHaveLength(10);
  });
});
