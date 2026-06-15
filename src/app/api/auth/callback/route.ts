import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/overview';

    if (code) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error('Supabase OAuth exchange error:', error);
    }

    return NextResponse.redirect(`${origin}/login?error=Google authentication failed`);
  } catch (err: any) {
    console.error('OAuth Callback route error:', err);
    return NextResponse.redirect(new URL('/login?error=Google callback routing error', request.url));
  }
}
