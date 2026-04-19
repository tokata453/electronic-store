import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SpecificationsEditor from './SpecsEditor';

vi.mock('./useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

describe('SpecificationsEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds and updates spec rows', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SpecificationsEditor specifications={{ display: 'OLED' }} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /add spec/i }));
    const inputs = screen.getAllByRole('textbox');
    await user.clear(inputs[0]);
    await user.type(inputs[0], 'Battery');
    await user.clear(inputs[1]);
    await user.type(inputs[1], '5000mAh');

    expect(onChange).toHaveBeenCalled();
  });
});
