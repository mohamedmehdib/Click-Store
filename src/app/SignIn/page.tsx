'use client';

import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !authData) {
        if (signInError && signInError.message.includes("Invalid login credentials")) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

          if (userError || !userData) {
            setErrorMessage('Account does not exist. Please sign up.');
          } else {
            setErrorMessage('Incorrect password. Please try again.');
          }
        } else {
          setErrorMessage('An unexpected error occurred. Please try again later.');
        }
        setLoading(false);
        return;
      }

      router.push('/Account');
    } catch (err) {
      console.log(err);
      setErrorMessage('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [email, password, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-8 bg-white shadow-xl rounded-lg w-80">
        <h2 className="text-2xl font-semibold mb-4">Sign In</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleSignIn}
          className={`w-full py-2 bg-blue-500 text-white rounded ${loading ? 'opacity-50' : ''}`}
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        {errorMessage && (
          <p className="text-red-500 text-center mt-4">{errorMessage}</p>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <span
              onClick={() => router.push('/SignUp')}
              className="text-blue-500 cursor-pointer"
            >
              Sign Up
            </span>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <span
              onClick={() => router.push('/Reset')}
              className="text-blue-500 cursor-pointer"
            >
              Reset Password
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;