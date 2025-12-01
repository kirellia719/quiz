import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Exam, Question } from '../types';
import { Plus, Trash2, Eye, BarChart, ChevronLeft, Save } from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TeacherDashboardProps {
  onLogout: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout }) => {
  const [view, setView] = useState<'list' | 'create' | 'stats'>('list');
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  // Create Exam State
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamQuestions, setNewExamQuestions] = useState<Question[]>([]);
  const [examDuration, setExamDuration] = useState(30);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [showAnswers, setShowAnswers] = useState(false);

  // Question Form State
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = () => {
    setExams(StorageService.getExams());
  };

  const handleCreateExam = () => {
    if (!newExamTitle.trim() || newExamQuestions.length === 0) return;

    const newExam: Exam = {
      id: Date.now().toString(),
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      title: newExamTitle,
      questions: newExamQuestions,
      config: {
        durationMinutes: examDuration,
        maxAttempts: maxAttempts,
        showAnswersAfter: showAnswers
      },
      createdAt: Date.now(),
      active: true
    };

    StorageService.saveExam(newExam);
    loadExams();
    resetCreateForm();
    setView('list');
  };

  const resetCreateForm = () => {
    setNewExamTitle('');
    setNewExamQuestions([]);
    setExamDuration(30);
    setMaxAttempts(1);
    setShowAnswers(false);
    resetQuestionForm();
  };

  const resetQuestionForm = () => {
    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrect(0);
  };

  const addQuestion = () => {
    if (!qText.trim() || qOptions.some(o => !o.trim())) return;

    const newQuestion: Question = {
      id: Date.now().toString(),
      text: qText,
      options: [...qOptions],
      correctOptionIndex: qCorrect
    };

    setNewExamQuestions([...newExamQuestions, newQuestion]);
    resetQuestionForm();
  };

  const handleDeleteExam = (id: string) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      StorageService.deleteExam(id);
      loadExams();
    }
  };

  const renderStats = () => {
    if (!selectedExamId) return null;
    const exam = exams.find(e => e.id === selectedExamId);
    if (!exam) return null;

    const submissions = StorageService.getSubmissions(selectedExamId);
    const averageScore = submissions.length > 0 
      ? submissions.reduce((acc, curr) => acc + curr.score, 0) / submissions.length 
      : 0;

    const chartData = submissions.map((sub, idx) => ({
      name: sub.studentName,
      score: (sub.score / sub.totalQuestions) * 100
    }));

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('list')} className="p-2 hover:bg-gray-200 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold">Statistics: {exam.title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Total Submissions</h3>
            <p className="text-3xl font-bold text-gray-800">{submissions.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Average Score</h3>
            <p className="text-3xl font-bold text-indigo-600">{((averageScore / exam.questions.length) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
             <h3 className="text-gray-500 text-sm font-medium">Exam Code</h3>
             <p className="text-3xl font-bold text-green-600 tracking-wider">{exam.code}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100 h-80">
          <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#4f46e5" name="Score %" />
            </ReBarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{sub.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{sub.studentClass}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {sub.score} / {sub.totalQuestions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(sub.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No submissions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (view === 'create') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('list')} className="p-2 hover:bg-gray-200 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold">Create New Exam</h2>
        </div>

        <div className="space-y-6">
          {/* Exam Details Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-indigo-700">Exam Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
                <input
                  type="text"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g., Mathematics Mid-term"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={examDuration}
                  onChange={(e) => setExamDuration(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
                <input
                  type="number"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  checked={showAnswers}
                  onChange={(e) => setShowAnswers(e.target.checked)}
                  id="showAnswers"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="showAnswers" className="ml-2 block text-sm text-gray-900">
                  Allow students to view answers after submission
                </label>
              </div>
            </div>
          </div>

          {/* Add Question Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-indigo-700">Add Question ({newExamQuestions.length} added)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                <textarea
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  rows={3}
                  placeholder="Enter the question here..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {qOptions.map((opt, idx) => (
                  <div key={idx}>
                     <label className="block text-xs font-medium text-gray-500 mb-1">Option {idx + 1}</label>
                     <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="correctOption"
                            checked={qCorrect === idx}
                            onChange={() => setQCorrect(idx)}
                            className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                                const newOpts = [...qOptions];
                                newOpts[idx] = e.target.value;
                                setQOptions(newOpts);
                            }}
                            className="flex-1 border border-gray-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder={`Option ${idx + 1}`}
                        />
                     </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addQuestion}
                className="mt-4 w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add Question
              </button>
            </div>
          </div>

          {/* Questions Preview */}
          {newExamQuestions.length > 0 && (
             <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Preview Questions:</h4>
                {newExamQuestions.map((q, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-start">
                        <div>
                            <p className="font-medium text-sm"><span className="text-indigo-600 font-bold">{i+1}.</span> {q.text}</p>
                            <p className="text-xs text-gray-500 mt-1">Correct Answer: {q.options[q.correctOptionIndex]}</p>
                        </div>
                        <button 
                            onClick={() => setNewExamQuestions(newExamQuestions.filter((_, idx) => idx !== i))}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
             </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
                onClick={() => setView('list')}
                className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
                Cancel
            </button>
            <button
                onClick={handleCreateExam}
                className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
            >
                <Save size={18} /> Save Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'stats') {
    return renderStats();
  }

  // List View
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
        <div className="flex gap-4">
             <button
                onClick={onLogout}
                className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
            >
                Logout
            </button>
            <button
            onClick={() => setView('create')}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2"
            >
            <Plus size={20} /> Create Exam
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{exam.title}</h3>
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                  {exam.code}
                </span>
              </div>
              <div className="text-sm text-gray-500 space-y-2 mb-6">
                <p>Questions: {exam.questions.length}</p>
                <p>Duration: {exam.config.durationMinutes} mins</p>
                <p>Attempts Allowed: {exam.config.maxAttempts}</p>
                <p>Created: {new Date(exam.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedExamId(exam.id);
                    setView('stats');
                  }}
                  className="flex-1 bg-indigo-50 text-indigo-700 py-2 rounded hover:bg-indigo-100 flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <BarChart size={16} /> Stats
                </button>
                <button
                  onClick={() => handleDeleteExam(exam.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded border border-transparent hover:border-red-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {exams.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No exams created yet.</p>
                <button onClick={() => setView('create')} className="mt-4 text-indigo-600 hover:underline">Create your first exam</button>
            </div>
        )}
      </div>
    </div>
  );
};