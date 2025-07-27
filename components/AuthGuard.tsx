'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const user = getCurrentUser();
      const authenticated = !!user;
      
      setIsAuthenticated(authenticated);
      setIsLoading(false);
      
      // Redirect to login if not authenticated and not already on auth pages
      if (!authenticated && !pathname.startsWith('/auth')) {
        router.push('/auth/login');
      }
      
      // Redirect to dashboard if authenticated and on auth pages
      if (authenticated && pathname.startsWith('/auth')) {
        router.push('/');
      }
    };

    checkAuth();
    
    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dovepeak_auth') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dovepeak Quotation Master</h2>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth pages without navigation
  if (pathname.startsWith('/auth')) {
    return <>{children}</>;
  }

  // Show main app only if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  return null;
}