import { useState } from 'react';
import Login from './Login';
import Register from './Register';

export default function AuthLayout() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 transition-opacity duration-700 ease-in-out z-0">
        <div
          className={`absolute inset-0 bg-gradient-to-tr from-purple-400 via-blue-500 to-indigo-600 transition-opacity duration-700 ${
            isLogin ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-tr from-green-400 via-blue-400 to-cyan-500 transition-opacity duration-700 ${
            isLogin ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>

      <div className="relative w-full max-w-2xl h-[540px] overflow-hidden bg-white shadow-xl rounded-xl z-10 transition-all duration-700">
        <div
          className={`flex transition-transform duration-700 ease-in-out w-[200%] h-full ${
            isLogin ? 'translate-x-0' : '-translate-x-1/2'
          }`}
        >
          <div className="w-1/2 p-6">
            <Login onSwitch={() => setIsLogin(false)} />
          </div>

          <div className="w-1/2 p-6">
            <Register onSwitch={() => setIsLogin(true)} />
          </div>
        </div>
      </div>
    </div>
  );
}
