import React from 'react'
import {
  NumericFormat,
  type NumericFormatProps,
  type NumberFormatValues,
} from 'react-number-format'

import { Input, type InputProps } from '@/components/ui/input'

interface FormattedNumberInputProps
  extends Omit<
    NumericFormatProps,
    | 'customInput'
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
    | 'thousandSeparator'
    | 'decimalSeparator'
  > {
  value?: number | string
  defaultValue?: number | string
  currency?: 'VND' | 'USD'
  onValueChange?: (value: number | undefined) => void
  inputProps?: Omit<InputProps, 'value' | 'defaultValue' | 'onChange' | 'type'>
}

const FormattedNumberInput = React.forwardRef<
  HTMLInputElement,
  FormattedNumberInputProps
>(
  (
    {
      value,
      defaultValue,
      currency = 'VND',
      onValueChange,
      inputProps,
      decimalScale,
      ...props
    },
    ref
  ) => {
    // Currency-specific formatting
    const formatConfig = {
      VND: {
        thousandSeparator: '.',
        decimalSeparator: ',',
        decimalScale: decimalScale ?? 2,
      },
      USD: {
        thousandSeparator: ',',
        decimalSeparator: '.',
        decimalScale: decimalScale ?? 2,
      },
    }

    const config = formatConfig[currency]

    return (
      <NumericFormat
        customInput={Input}
        getInputRef={ref}
        value={value}
        defaultValue={defaultValue}
        thousandSeparator={config.thousandSeparator}
        decimalSeparator={config.decimalSeparator}
        decimalScale={config.decimalScale}
        fixedDecimalScale={false}
        allowNegative={false}
        allowLeadingZeros={false}
        onValueChange={(values: NumberFormatValues) => {
          // Pass the raw numeric value to the form
          onValueChange?.(values.floatValue)
        }}
        {...props}
        {...inputProps}
      />
    )
  }
)

FormattedNumberInput.displayName = 'FormattedNumberInput'

export { FormattedNumberInput }
export type { FormattedNumberInputProps }
