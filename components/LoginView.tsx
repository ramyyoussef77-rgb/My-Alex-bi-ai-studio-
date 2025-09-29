import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, signupUser } from '../store/slices/userSlice';
import { UserType } from '../types';

const LoginView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profile, setProfile] = useState<UserType>(UserType.Tourist);
  
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector(state => state.user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      dispatch(loginUser({ email, password }));
    } else {
      dispatch(signupUser({ displayName, email, password, profile }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-beige p-4">
      <div className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-md p-8 rounded-lg shadow-lg border border-white/40">
        <h2 className="text-3xl font-serif font-bold text-sea-blue text-center mb-2">
          {isLogin ? 'Welcome Back' : 'Join the Community'}
        </h2>
        <p className="text-center text-dark-accent/80 mb-8">{isLogin ? 'Sign in to continue' : 'Create an account to get started'}</p>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-sea-blue font-bold mb-2" htmlFor="displayName">Display Name</label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-3 border-2 border-light-blue rounded-lg"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sea-blue font-bold mb-2">I am a...</label>
                <div className="flex flex-wrap gap-2">
                   {Object.values(UserType).map((type) => (
                    <button type="button" key={type} onClick={() => setProfile(type)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${profile === type ? 'bg-sea-blue text-white' : 'bg-light-blue text-dark-accent'}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-sea-blue font-bold mb-2" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-light-blue rounded-lg"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sea-blue font-bold mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-light-blue rounded-lg"
              required
            />
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          
          <button
            type="submit"
            disabled={status === 'loading'}
            className="button-ripple w-full bg-highlight text-white font-bold py-3 px-4 rounded-lg hover:bg-sea-blue transition-colors duration-300 disabled:bg-gray-400"
          >
            {status === 'loading' ? 'Loading...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>
        
        <p className="text-center mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-sea-blue hover:underline ml-2">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginView;
