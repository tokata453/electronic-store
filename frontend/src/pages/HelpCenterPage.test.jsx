import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import HelpCenterPage from './HelpCenterPage';

describe('HelpCenterPage', () => {
  it('switches tabs through the query string and expands an FAQ', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/help?tab=shipping']}>
        <Routes>
          <Route path="/help" element={<HelpCenterPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /shipping & returns/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /privacy policy/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /general faq/i }));
    expect(screen.getByRole('heading', { name: /frequently asked questions/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /are your products brand new and authentic\?/i }));
    expect(screen.getByText(/yes, absolutely/i)).toBeInTheDocument();
  });
});
