# Supabase Migration Guide

## 1. Install PostgreSQL driver:
```bash
npm install pg @types/pg
npm uninstall mysql2
```

## 2. Update lib/db.ts:
```typescript
import { Pool } from 'pg'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})
```

## 3. Convert MySQL syntax to PostgreSQL:
- `AUTO_INCREMENT` → `SERIAL`
- `ENUM('value1', 'value2')` → `VARCHAR(50) CHECK (column IN ('value1', 'value2'))`
- `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` → `TIMESTAMP DEFAULT NOW()`
- `ON DUPLICATE KEY UPDATE` → `ON CONFLICT ... DO UPDATE`