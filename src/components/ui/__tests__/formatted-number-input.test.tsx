import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import { FormattedNumberInput } from '../formatted-number-input'

describe('FormattedNumberInput', () => {
  it('renders with default VND formatting', () => {
    render(<FormattedNumberInput placeholder="Enter amount" />)

    const input = screen.getByPlaceholderText('Enter amount')
    expect(input).toBeInTheDocument()
  })

  it('formats VND currency with period thousand separator and comma decimal', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()

    render(
      <FormattedNumberInput
        currency="VND"
        onValueChange={mockOnChange}
        placeholder="Amount"
      />
    )

    const input = screen.getByPlaceholderText('Amount')

    // Type a large number
    await user.type(input, '1234567.89')

    // Check formatted display
    expect(input).toHaveValue('1.234.567,89')
    // Check callback receives raw number
    expect(mockOnChange).toHaveBeenLastCalledWith(1234567.89)
  })

  it('formats USD currency with comma thousand separator and period decimal', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()

    render(
      <FormattedNumberInput
        currency="USD"
        onValueChange={mockOnChange}
        placeholder="Amount"
      />
    )

    const input = screen.getByPlaceholderText('Amount')

    // Type a large number
    await user.type(input, '1234567.89')

    // Check formatted display
    expect(input).toHaveValue('1,234,567.89')
    // Check callback receives raw number
    expect(mockOnChange).toHaveBeenLastCalledWith(1234567.89)
  })

  it('handles initial value prop correctly', () => {
    render(
      <FormattedNumberInput
        value={50000.25}
        currency="VND"
        placeholder="Amount"
      />
    )

    const input = screen.getByPlaceholderText('Amount')
    expect(input).toHaveValue('50.000,25')
  })

  it('supports custom decimal scale', async () => {
    const user = userEvent.setup()

    render(
      <FormattedNumberInput
        currency="USD"
        decimalScale={4}
        placeholder="Rate"
      />
    )

    const input = screen.getByPlaceholderText('Rate')
    await user.type(input, '1.23456789')

    // Should limit to 4 decimal places
    expect(input).toHaveValue('1.2345')
  })

  it('prevents negative numbers by default', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()

    render(
      <FormattedNumberInput onValueChange={mockOnChange} placeholder="Amount" />
    )

    const input = screen.getByPlaceholderText('Amount')

    // Try to type negative number
    await user.type(input, '-100')

    // Should not accept negative
    expect(input).toHaveValue('100')
    expect(mockOnChange).toHaveBeenLastCalledWith(100)
  })

  it('handles empty and undefined values', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()

    render(
      <FormattedNumberInput onValueChange={mockOnChange} placeholder="Amount" />
    )

    const input = screen.getByPlaceholderText('Amount')

    // Type then clear
    await user.type(input, '123')
    await user.clear(input)

    expect(mockOnChange).toHaveBeenLastCalledWith(undefined)
  })

  it('preserves input props and styling', () => {
    render(
      <FormattedNumberInput
        placeholder="Test"
        inputProps={{
          className: 'custom-class',
        }}
        data-testid="custom-input"
      />
    )

    const input = screen.getByTestId('custom-input')
    expect(input).toHaveClass('custom-class')
    expect(input).toHaveAttribute('placeholder', 'Test')
  })

  it('changes formatting when currency prop changes', () => {
    const { rerender } = render(
      <FormattedNumberInput
        value={1234.56}
        currency="VND"
        placeholder="Amount"
      />
    )

    let input = screen.getByPlaceholderText('Amount')
    expect(input).toHaveValue('1.234,56')

    // Change currency to USD
    rerender(
      <FormattedNumberInput
        value={1234.56}
        currency="USD"
        placeholder="Amount"
      />
    )

    input = screen.getByPlaceholderText('Amount')
    expect(input).toHaveValue('1,234.56')
  })
})
