---
name: app-initialization
description: Init currency converter app
---
**Create a complete Currency Converter App from scratch using Next.js and TypeScript.**

---

### Technical Requirements

- Next.js (App Router) with latest version
- TypeScript for type safety
- Tailwind CSS for styling
- Node.js server-side implementation
- Responsive design (mobile and desktop)

---

### Project Structure

- `/app` - Next.js App Router structure
- `/app/api/rates/route.ts` - API endpoint for exchange rates
- `/utils/` folder for helper functions (currency.ts, storage.ts)
- `/types/` folder for TypeScript interfaces
- Standard Next.js configuration files

---

### Core Features

#### 1. **API Integration**

- Fetch exchange rates from multiple sources with fallbacks
  (exchangerate.host, exchangerate-api.com, open.er-api.com)
- Handle SSL certificate issues with proper Node.js implementation
- Implement 1-hour caching with Next.js revalidate

#### 2. **Currency Conversion**

- Client-side conversion with proper decimal handling
- Support for 10 popular currencies

#### 3. **User Interface**

- Clean, modern design
- Amount input with validation, validation under the field
- Source/target currency dropdowns
- Convert button with loading state between Source/target currency
- Result display with formatted amounts and exchange rate
- Error messages for invalid inputs and API failures
- All inputs in one line
- No refresh button — conversion should happen automatically on input
  or selection change
- Swap button should be between the currency dropdowns

#### 4. **Advanced Features**

- Currency swap functionality
- URL query parameter persistence
- Conversion history (last 10 conversions)
- History management (view, reload, clear)

---

### Error Handling

- Client input validation with user feedback
- API error handling with multiple fallback sources
- Graceful degradation when services are unavailable
- Timeout handling for slow connections

---

### Deliverables

#### 1. **Complete application code**

- All source files organized in proper Next.js structure
- Well-commented TypeScript code
- Proper error handling throughout

#### 2. **Documentation**

- README.md with setup instructions and features
- CHANGELOG.md for version history

---

### Additional Requirements

Ensure the application works without requiring additional configuration and
addresses common issues like SSL certificate problems when fetching from
external APIs. Use nice styles.

---

## Testing Requirements

Add unit tests with Jest + React Testing Library, following best practices for Next.js

### 1. **Testing Framework Preference**

Jest + React Testing Library

### 2. **Test Coverage Goals**

All unit tests + API routes

### 3. **Mocking Strategy**

MSW for API mocking + Jest mocks for other dependencies

### 4. **Test File Organization**

Tests co-located with source files (component.tsx + component.test.tsx)

---

## Component Architecture

Break down the large components into smaller, reusable components following React best practices.