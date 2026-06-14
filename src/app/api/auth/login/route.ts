import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { isMysqlConfigured, verifyUserInMysql } from '@/lib/db/mysql';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: result.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // If MySQL is configured, verify user credentials in MySQL
    if (isMysqlConfigured()) {
      try {
        const user = await verifyUserInMysql(email);
        if (!user || user.password !== password) {
          return NextResponse.json(
            { success: false, data: null, error: 'Invalid email or password' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
            },
          },
          error: null,
        });
      } catch (err: any) {
        return NextResponse.json(
          { success: false, data: null, error: `MySQL Auth failure: ${err.message}` },
          { status: 500 }
        );
      }
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: 'mock-user-123',
            email: email,
          },
        },
        error: null,
      });
    }
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
      error: null,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: 'An internal server error occurred',
      },
      { status: 500 }
    );
  }
}
