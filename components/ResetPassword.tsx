
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { GlassButton } from './UI';

export const ResetPassword: React.FC = () => {
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (pass !== confirm) return alert("Passwords don't match");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pass });
    if (!error) {
      alert('Password updated!');
      window.location.pathname = '/';
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-enter">
      <h1 className="text-2xl font-bold mb-6">Set New Password</h1>
      <div className="w-full max-w-xs space-y-4">
        <input type="password" placeholder="New Password" value={pass} onChange={e => setPass(e.target.value)} className="w-full glass-input p-4 rounded-2xl outline-none" />
        <input type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full glass-input p-4 rounded-2xl outline-none" />
        <GlassButton variant="accent" className="w-full" onClick={handleUpdate}>{loading ? 'Updating...' : 'Update Password'}</GlassButton>
      </div>
    </div>
  );
};
