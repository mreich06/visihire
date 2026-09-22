import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Dropdown, DropdownItem } from './dropdown';

describe('Dropdown', () => {
  it('opens the menu when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown label="Choose one">
        <DropdownItem>Option A</DropdownItem>
      </Dropdown>,
    );

    expect(screen.queryByText('Option A')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Choose one' }));

    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('closes the menu when the trigger is clicked again', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown label="Choose one">
        <DropdownItem>Option A</DropdownItem>
      </Dropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'Choose one' });
    await user.click(trigger);
    expect(screen.getByText('Option A')).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.queryByText('Option A')).not.toBeInTheDocument();
  });

  it('closes the menu when clicking outside of it', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Dropdown label="Choose one">
          <DropdownItem>Option A</DropdownItem>
        </Dropdown>
        <button type="button">Outside</button>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'Choose one' }));
    expect(screen.getByText('Option A')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByText('Option A')).not.toBeInTheDocument();
  });

  it('calls the item onClick and closes the menu when a DropdownItem is clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <Dropdown label="Choose one">
        <DropdownItem onClick={onSelect}>Option A</DropdownItem>
      </Dropdown>,
    );

    await user.click(screen.getByRole('button', { name: 'Choose one' }));
    await user.click(screen.getByText('Option A'));

    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByText('Option A')).not.toBeInTheDocument();
  });

  it('does not close the menu when clicking a non-DropdownItem element inside it', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown label="Choose one">
        <input placeholder="Search" />
        <DropdownItem>Option A</DropdownItem>
      </Dropdown>,
    );

    await user.click(screen.getByRole('button', { name: 'Choose one' }));
    await user.click(screen.getByPlaceholderText('Search'));

    expect(screen.getByText('Option A')).toBeInTheDocument();
  });
});
