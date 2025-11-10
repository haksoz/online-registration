import { notFound } from 'next/navigation'
import POSLogDetailClient from './POSLogDetailClient'
import { pool } from '@/lib/db'

async function getPOSTransaction(id: string) {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        opt.*,
        r.reference_number,
        r.full_name,
        r.email,
        r.phone,
        r.registration_type
      FROM online_payment_transactions opt
      LEFT JOIN registrations r ON opt.registration_id = r.id
      WHERE opt.id = ?`,
      [id]
    )

    if (!Array.isArray(rows) || rows.length === 0) {
      return null
    }

    return rows[0] as any
  } catch (error) {
    console.error('Error fetching POS transaction:', error)
    return null
  }
}

export default async function POSLogDetailPage({ params }: { params: { id: string } }) {
  const transaction = await getPOSTransaction(params.id)

  if (!transaction) {
    notFound()
  }

  return <POSLogDetailClient transaction={transaction} />
}
