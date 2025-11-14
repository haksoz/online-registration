# Database Migration Instructions

## Refund Status Enum Update

### Problem
The `refund_status` column in the database has old enum values that don't match the application code.

**Database has:** `'none', 'requested', 'approved', 'completed'`  
**Code expects:** `'none', 'pending', 'completed', 'rejected'`

### Solution

#### Step 1: Add Environment Variable to Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - **Name:** `MIGRATION_SECRET`
   - **Value:** `refund-status-migration-2024`
   - **Environment:** Production
3. Click "Save"
4. Redeploy the project (or wait for auto-deploy)

#### Step 2: Run Migration
1. Open your browser
2. Go to: `https://your-vercel-domain.vercel.app/api/admin/migrate-refund-status?secret=refund-status-migration-2024`
3. You should see a success message with before/after column details

#### Step 3: Verify
Try canceling a registration with "completed" payment status. It should work now!

#### Step 4: Clean Up (Optional)
After successful migration, you can:
1. Delete the migration endpoint: `app/api/admin/migrate-refund-status/route.ts`
2. Remove the `MIGRATION_SECRET` from Vercel environment variables

---

## Alternative: Manual SQL (if you have database access)

If you have direct access to the Railway MySQL database:

```sql
ALTER TABLE registrations 
MODIFY COLUMN refund_status ENUM('none', 'pending', 'completed', 'rejected') DEFAULT 'none';
```

Verify:
```sql
SHOW COLUMNS FROM registrations LIKE 'refund_status';
```
