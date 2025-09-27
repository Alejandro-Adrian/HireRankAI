import "@testing-library/jest-dom"

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveValue(value: string | number | string[]): R
      toHaveAttribute(attr: string, value?: string): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveClass(className: string): R
      toHaveTextContent(text: string | RegExp): R
      toBeVisible(): R
      toBeChecked(): R
      toHaveFocus(): R
      toBeRequired(): R
      toBeValid(): R
      toBeInvalid(): R
    }
  }
}
