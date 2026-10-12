import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const roleParam = requestUrl.searchParams.get('role');
  const nextParam = requestUrl.searchParams.get('next');
  const origin = requestUrl.origin;

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Supabase OAuth exchange error:', error.message);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
      }

      const user = data.user;
      if (user) {
        // 1. Fetch user role from 'profiles' table
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        let resolvedRole: 'teacher' | 'student' = 'student';

        if (profile?.role === 'teacher') {
          resolvedRole = 'teacher';
        } else {
          resolvedRole = 'student';
        }

        if (!profile) {
          // If profile doesn't exist yet, insert new profile from OAuth metadata
          // Security: Default new Google logins to 'student' unless teacher was explicitly requested
          const preferredRole: 'teacher' | 'student' = roleParam === 'teacher' ? 'teacher' : 'student';
          resolvedRole = preferredRole;

          await supabase.from('profiles').upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Kullanıcı',
            username: user.email?.split('@')[0] || `user_${user.id.slice(0, 6)}`,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            role: preferredRole,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        // 2. Validate redirect destination against open-redirect attacks
        let targetPath = resolvedRole === 'teacher' ? '/dashboard' : '/student';

        if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')) {
          targetPath = nextParam;
        }

        const response = NextResponse.redirect(`${origin}${targetPath}`);

        // Set secure session indicator cookies
        const cookieOpts = {
          path: '/',
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          maxAge: 60 * 60 * 24 * 7, // 7 days
        };

        response.cookies.set('dersly_auth_token', user.id, cookieOpts);
        response.cookies.set('dersly_user_id', user.id, cookieOpts);
        response.cookies.set('dersly_user_role', resolvedRole, cookieOpts);

        // Backwards compatibility with legacy cookie names
        response.cookies.set('derspompa_auth_token', user.id, cookieOpts);
        response.cookies.set('derspompa_user_id', user.id, cookieOpts);
        response.cookies.set('derspompa_user_role', resolvedRole, cookieOpts);

        return response;
      }
    } catch (err: unknown) {
      console.error('Unhandled callback exception:', err);
      return NextResponse.redirect(`${origin}/login?error=oauth_internal_error`);
    }
  }

  // If no code is present, redirect to login
  return NextResponse.redirect(`${origin}/login?error=missing_oauth_code`);
}
