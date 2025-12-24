import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Server-side API URL (uses Docker network name for container-to-container communication)
const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005/api';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';
  is_super_admin: boolean;
  permissions: string[];
  accessToken: string;
  refreshToken: string;
}

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';
      is_super_admin: boolean;
      permissions: string[];
      emailVerified?: Date | null;
      accessToken?: string;
      refreshToken?: string;
    };
  }

  interface User extends AdminUser {}
}

async function loginApi(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/admin/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Credenciais inválidas');
  }

  return response.json();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await loginApi(
            credentials.email as string,
            credentials.password as string
          );

          // Build full name from first_name and last_name
          const name = [response.user.first_name, response.user.last_name]
            .filter(Boolean)
            .join(' ') || response.user.email;

          return {
            id: String(response.user.id),
            email: response.user.email,
            name,
            role: response.user.role,
            is_super_admin: response.user.role === 'SUPER_ADMIN',
            permissions: response.user.permissions || [],
            accessToken: response.access,
            refreshToken: response.refresh,
          };
        } catch (error) {
          console.error('[Auth] Login error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const adminUser = user as AdminUser;
        token.accessToken = adminUser.accessToken;
        token.refreshToken = adminUser.refreshToken;
        token.user = {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          is_super_admin: adminUser.is_super_admin,
          permissions: adminUser.permissions,
        };
      }
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      const userFromToken = token.user as {
        id: string;
        email: string;
        name: string;
        role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';
        is_super_admin: boolean;
        permissions: string[];
      };
      session.user = {
        ...userFromToken,
        emailVerified: null,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
      };
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  trustHost: true,
});
