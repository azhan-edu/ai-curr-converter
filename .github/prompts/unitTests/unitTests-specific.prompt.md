**Objective**: Create comprehensive unit tests for the `ConversionHistory` component with 100% coverage.

## Files

- **Component to Test**: `components/ConversionHistory.tsx`
- **Test File to Create**: `components/ConversionHistory.test.tsx`

## Testing Stack

- Library: @testing-library/react
- Assertion: @testing-library/jest-dom
- Runner: Jest (already configured)

## What to Test

### 1. Conditional Rendering

- Clear button visibility
- Empty state display
- History list visibility

### 2. Button Interactions & Callbacks

- `onToggle` callback
- `onClear` callback
- `onLoadConversion` callback

### 3. Dynamic Content

- Toggle button text based on `showHistory` prop
- History count display

### 4. Conversion Data Rendering

- Amount display
- Currency codes
- Exchange rate
- Timestamp formatting

### 5. Edge Cases

- Empty history array
- Multiple conversion items
- Different timestamp formats

## Success Criteria

1. All tests pass: `npm test -- ConversionHistory`
2. Coverage shows 100%: `npm test -- --coverage ConversionHistory`
3. Follow same code style as existing test files

## Reference Files

Use these as examples:

- `components/AmountInput.test.tsx` - Test structure
- `components/ConverterForm.test.tsx` - Complex interactions