import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders a label when provided', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('applies labelClassName to the label element', () => {
    const { container } = render(<Input label="First name" labelClassName="text-center" />);
    const label = container.querySelector('label');
    expect(label).toHaveClass('text-center');
  });

  it('applies leftIcon padding class', () => {
    render(<Input leftIcon={<span data-testid="icon" />} />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('pl-14');
  });

  it('applies rightIcon padding class', () => {
    render(<Input rightIcon={<span data-testid="icon" />} />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('pr-24');
  });

  it('displays error message when error prop is set', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('does not display error when error is undefined', () => {
    render(<Input label="Email" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
