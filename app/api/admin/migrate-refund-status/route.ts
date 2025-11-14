import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Security check - only allow in development or with secret key
    const secret = request.nextUrl.searchParams.get('secret')
    const expectedSecret = process.env.MIGRATION_SECRET || 'your-secret-key-here'
    
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid secret key' },
        { status: 401 }
      )
    }

    // Check current enum values
    const [columns] = await pool.execute(
      "SHOW COLUMNS FROM registrations LIKE 'refund_status'"
    )
    
    const currentColumn = (columns as any[])[0]
    console.log('Current refund_status column:', currentColumn)

    // Update the enum
    await pool.execute(`
      ALTER TABLE registrations 
      MODIFY COLUMN refund_status ENUM('none', 'pending', 'completed', 'rejected') DEFAULT 'none'
    `)

    // Verify the change
    const [updatedColumns] = await pool.execute(
      "SHOW COLUMNS FROM registrations LIKE 'refund_status'"
    )
    
    const updatedColumn = (updatedColumns as any[])[0]

    return NextResponse.json({
      success: true,
      message: 'refund_status enum updated successfully',
      before: currentColumn,
      after: updatedColumn
    }, { status: 200 })

  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json({
      error: 'Migration failed',
      details: error.message,
      sqlMessage: error.sqlMessage
    }, { status: 500 })
  }
}
