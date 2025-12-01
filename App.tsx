import React, { useState } from 'react';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentPortal } from './components/StudentPortal';
import { UserRole } from './types';
import { BookOpen, User, GraduationCap } from 'lucide-react';
import { AIAssistant } from './components/AIAssistant';

// Mock credentials for the purpose of this demo
const TEACHER_USERNAME = "admin";
const TEACHER_PASSWORD = "password";

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.NONE);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === TEACHER_USERNAME && password === TEACHER_PASSWORD) {
        setRole(UserRole.TEACHER);
        setAuthError('');
    } else {
        setAuthError("Invalid credentials");
    }
  };

  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <BookOpen className="text-indigo-600" />
                QuizMaster AI
            </h1>
            <p className="text-gray-500 mt-2">Select your role to continue</p>
        </div>

        <div className="space-y-6">
             {/* Role Selection Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                <button 
                    onClick={() => { setAuthError(''); setUsername(''); setPassword(''); }}
                    className={`py-2 rounded-md text-sm font-medium transition-all ${role === UserRole.NONE ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Teacher Login
                </button>
                <button 
                    onClick={() => setRole(UserRole.STUDENT)}
                    className={`py-2 rounded-md text-sm font-medium transition-all hover:bg-white hover:shadow hover:text-indigo-600`}
                >
                    Student Access
                </button>
            </div>

            {role !== UserRole.STUDENT && (
                <form onSubmit={handleTeacherLogin} className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                placeholder="admin"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute left-3 top-3 text-gray-400">🔒</div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                placeholder="password"
                            />
                        </div>
                    </div>
                    {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
                        Login as Teacher
                    </button>
                    <p className="text-xs text-center text-gray-400">Default: admin / password</p>
                </form>
            )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {role === UserRole.NONE && renderLogin()}
      
      {role === UserRole.TEACHER && (
        <div className="p-4 md:p-8">
            <TeacherDashboard onLogout={() => setRole(UserRole.NONE)} />
        </div>
      )}

      {role === UserRole.STUDENT && (
        <div className="p-4 md:p-8">
            <StudentPortal onLogout={() => setRole(UserRole.NONE)} />
        </div>
      )}

      {/* Global AI Assistant - Always available for convenience */}
      <AIAssistant />
    </div>
  );
};

export default App;