import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    host: process.env.DB_HOST || 'NOT SET',
    user: process.env.DB_USER || 'NOT SET',
    password: process.env.DB_PASSWORD ? 'SET' : 'EMPTY',
    name: process.env.DB_NAME || 'NOT SET',
    port: process.env.DB_PORT || 'NOT SET',
    nodeEnv: process.env.NODE_ENV || 'NOT SET',
    allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('DB_')),
  });
}

