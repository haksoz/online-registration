# Design Document

## Overview

Bu tasarım, mevcut statik kayıt türü sistemini dinamik, veritabanı tabanlı bir sisteme dönüştürecektir. MySQL veritabanı, REST API ve React frontend bileşenleri kullanılarak tam CRUD işlevselliği sağlanacaktır.

## Architecture

### System Architecture
```
Frontend (React/Next.js)
    ↓ HTTP Requests
API Layer (/app/api/registration-types/)
    ↓ SQL Queries  
Database Layer (MySQL - registration_types table)
```

### Data Flow
1. **Read**: Frontend → API GET → MySQL SELECT → JSON Response
2. **Create**: Frontend Form → API POST → MySQL INSERT → Success Response
3. **Update**: Frontend Modal → API PUT → MySQL UPDATE → Success Response  
4. **Delete**: Frontend Confirm → API DELETE → MySQL DELETE → Success Response

## Components and Interfaces

### Database Schema

**Table: registration_types**
```sql
CREATE TABLE registration_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  value VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  fee DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### API Endpoints

**GET /api/registration-types**
```typescript
Response: {
  success: boolean,
  data: RegistrationType[]
}
```

**POST /api/registration-types**
```typescript
Request: {
  value: string,
  label: string, 
  fee: number,
  description?: string
}
Response: {
  success: boolean,
  data: { id: number },
  message: string
}
```

**PUT /api/registration-types/[id]**
```typescript
Request: {
  label: string,
  fee: number, 
  description?: string
}
Response: {
  success: boolean,
  message: string
}
```

**DELETE /api/registration-types/[id]**
```typescript
Response: {
  success: boolean,
  message: string
}
```

### Frontend Components

**RegistrationTypesPage** (Main Container)
- State management for registration types list
- Loading states and error handling
- Modal state management

**RegistrationTypesTable** (Data Display)
- Responsive table with Tailwind CSS
- Action buttons (Edit, Delete) per row
- Loading skeleton during data fetch

**AddRegistrationTypeModal** (Create Form)
- Form validation with react-hook-form
- Input fields: value, label, fee, description
- Submit handler for POST request

**EditRegistrationTypeModal** (Update Form)  
- Pre-populated form with existing data
- Form validation and submit handler for PUT request
- Disable value field (immutable after creation)

**DeleteConfirmModal** (Delete Confirmation)
- Warning message about deletion
- Check for existing registrations using this type
- Confirm/Cancel actions

## Data Models

### RegistrationType Interface
```typescript
interface RegistrationType {
  id: number
  value: string
  label: string
  fee: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}
```

### Form Data Types
```typescript
interface CreateRegistrationTypeData {
  value: string
  label: string
  fee: number
  description?: string
}

interface UpdateRegistrationTypeData {
  label: string
  fee: number
  description?: string
}
```

## Error Handling

### API Error Responses
```typescript
interface ApiError {
  success: false
  error: string
  details?: string[]
}
```

### Frontend Error States
- **Network Errors**: Connection timeout, server unavailable
- **Validation Errors**: Invalid input format, required fields
- **Business Logic Errors**: Duplicate value, type in use
- **Database Errors**: Connection issues, constraint violations

### Error Display Strategy
- Toast notifications for success/error messages
- Inline form validation errors
- Loading states during API calls
- Graceful fallbacks for failed operations

## Testing Strategy

### Unit Tests
- API route handlers (GET, POST, PUT, DELETE)
- Form validation logic
- Database query functions
- Component rendering and interactions

### Integration Tests  
- Full CRUD workflow testing
- API endpoint integration with database
- Frontend form submission to API
- Error handling across layers

### Manual Testing Scenarios
1. **Create Flow**: Add new registration type with all fields
2. **Update Flow**: Edit existing type, verify changes persist
3. **Delete Flow**: Delete unused type, verify removal
4. **Validation Flow**: Test invalid inputs, verify error messages
5. **Edge Cases**: Duplicate values, deleting type in use

## Security Considerations

### Input Validation
- Server-side validation for all API inputs
- SQL injection prevention with parameterized queries
- XSS prevention with input sanitization
- Rate limiting on API endpoints

### Access Control
- Admin authentication required for all operations
- Session validation on each API request
- CSRF protection for state-changing operations

### Data Integrity
- Database constraints (UNIQUE, NOT NULL)
- Transaction rollback on errors
- Audit trail with created_at/updated_at timestamps

## Performance Considerations

### Database Optimization
- Index on value field for uniqueness checks
- Efficient queries with proper WHERE clauses
- Connection pooling for concurrent requests

### Frontend Optimization
- Lazy loading for large datasets
- Debounced search/filter functionality
- Optimistic updates for better UX
- Caching of registration types data

### API Optimization
- Pagination for large result sets
- Compression for JSON responses
- Proper HTTP caching headers
- Minimal data transfer (only required fields)

## Migration Strategy

### Phase 1: Database Setup
1. Create registration_types table
2. Migrate existing constants data to database
3. Verify data integrity

### Phase 2: API Development
1. Implement GET endpoint first
2. Add POST, PUT, DELETE endpoints
3. Test all endpoints thoroughly

### Phase 3: Frontend Integration
1. Update registration types page to use API
2. Implement CRUD modals
3. Replace constants usage across application

### Phase 4: Cleanup
1. Remove old constants file references
2. Update form components to use dynamic data
3. Add proper error handling and loading states