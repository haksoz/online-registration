# Implementation Plan - Registration Logs System

## Phase 1: Database Setup

- [ ] 1.1 Create registration_logs table
  - Create SQL migration script
  - Add all required columns (IP, user agent, referrer, etc.)
  - Add indexes for performance
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 1.2 Test database schema
  - Insert test data
  - Verify foreign key constraints
  - Test indexes performance
  - _Requirements: 1.1_

## Phase 2: Helper Functions

- [ ] 2.1 Create getClientInfo helper
  - Implement getRealIP function with proxy support
  - Support X-Forwarded-For, X-Real-IP, CF-Connecting-IP
  - Add IP version detection (IPv4/IPv6)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2.2 Create parseUserAgent helper
  - Install ua-parser-js package
  - Implement user agent parsing
  - Extract browser, OS, device info
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2.3 Create parseReferrer helper
  - Extract referrer URL and domain
  - Parse UTM parameters
  - Handle missing referrer
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 2.4 Create collectClientInfo helper
  - Collect screen resolution
  - Get browser language
  - Get timezone
  - _Requirements: 4.1_

## Phase 3: API Implementation

- [ ] 3.1 Create registration log API endpoint
  - POST /api/registrations/[id]/log
  - Integrate all helper functions
  - Save log to database
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 3.2 Add error handling
  - Handle database errors
  - Handle invalid data
  - Log errors properly
  - _Requirements: 4.2_

- [ ] 3.3 Add GET endpoint for logs
  - GET /api/registrations/[id]/logs
  - Return formatted log data
  - Add pagination support
  - _Requirements: 5.1, 5.2_

## Phase 4: Frontend Integration

- [ ] 4.1 Update form store for tracking
  - Add formStartedAt state
  - Add stepsCompleted tracking
  - Add errorsEncountered tracking
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4.2 Add tracking to form steps
  - Track step 1 completion
  - Track step 2 completion
  - Track step 3 completion
  - Track step 4 completion
  - _Requirements: 4.1_

- [ ] 4.3 Integrate log submission
  - Call log API on form completion
  - Send all collected data
  - Handle async submission
  - _Requirements: 4.1, 4.3_

- [ ] 4.4 Add client info collection
  - Collect screen resolution
  - Collect language
  - Collect timezone
  - _Requirements: 4.1_

## Phase 5: Admin Panel Integration

- [ ] 5.1 Add logs section to registration detail page
  - Display IP address
  - Display browser/OS info
  - Display referrer
  - Display form timeline
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 5.2 Create log timeline component
  - Show step completions
  - Show errors
  - Show duration
  - _Requirements: 5.4_

- [ ] 5.3 Add security indicators
  - Show proxy/VPN detection
  - Show risk score
  - Show suspicious activity warnings
  - _Requirements: 5.5_

- [ ] 5.4 Add geolocation display (optional)
  - Integrate IP geolocation API
  - Display country/city
  - Show on map
  - _Requirements: 5.3_

## Phase 6: Security & Privacy

- [ ] 6.1 Implement GDPR compliance
  - Add data retention policy
  - Add anonymization option
  - Add deletion capability
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 6.2 Add proxy/VPN detection
  - Check against known proxy IPs
  - Detect Tor exit nodes
  - Calculate risk score
  - _Requirements: 1.1_

- [ ] 6.3 Add rate limiting
  - Limit registrations per IP
  - Flag suspicious activity
  - Add cooldown period
  - _Requirements: 5.5_

## Phase 7: Testing & Documentation

- [ ] 7.1 Test with different proxy configurations
  - Test X-Forwarded-For
  - Test X-Real-IP
  - Test Cloudflare headers
  - _Requirements: 1.2, 1.3, 1.4_

- [ ] 7.2 Test user agent parsing
  - Test desktop browsers
  - Test mobile browsers
  - Test bots
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 7.3 Create documentation
  - Document proxy configuration
  - Document privacy policy
  - Document admin usage
  - _Requirements: 6.1, 6.2, 6.3_
