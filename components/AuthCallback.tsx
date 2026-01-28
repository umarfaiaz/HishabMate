
import React, { useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const AuthCallback: React.FC = () => {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.pathname = '/';
      } else {
        // Just redirect to root, the main App router handles flow
        window.location.pathname = '/';
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};
