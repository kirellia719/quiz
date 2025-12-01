import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Exam, StudentSubmission } from '../types';
import { Clock, CheckCircle, XCircle, LogOut } from 'lucide-react';

interface StudentPortalProps {
    onLogout: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ onLogout }) => {
  const [step, setStep] = useState<'entry' | 'exam' | 'result'>('entry');
  
  // Entry State
  const [examCode, setExamCode] = useState('');
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [error, setError] = useState('');

  // Active Exam State
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);

  // Result State
  const [lastSubmission, setLastSubmission] = useState<StudentSubmission | null>(null);

  useEffect(() => {
    let timer: any;
    if (step === 'exam' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, timeLeft]);

  const handleJoinExam = () => {
    setError('');
    if (!examCode || !name || !studentClass) {
      setError("Please fill in all fields.");
      return;
    }

    const exam = StorageService.getExamByCode(examCode.trim());
    if (!exam) {
      setError("Invalid exam code.");
      return;
    }

    const attempts = StorageService.getStudentAttempts(exam.id, name, studentClass);
    if (attempts >= exam.config.maxAttempts) {
      setError(`You have reached the maximum number of attempts (${exam.config.maxAttempts}) for this exam.`);
      return;
    }

    setActiveExam(exam);
    setCurrentAnswers(new Array(exam.questions.length).fill(-1));
    setTimeLeft(exam.config.durationMinutes * 60);
    setStep('exam');
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...currentAnswers];
    newAnswers[questionIndex] = optionIndex;
    setCurrentAnswers(newAnswers);
  };

  const handleSubmitExam = () => {
    if (!activeExam) return;

    let score = 0;
    activeExam.questions.forEach((q, idx) => {
      if (currentAnswers[idx] === q.correctOptionIndex) {
        score++;
      }
    });

    const submission: StudentSubmission = {
      id: Date.now().toString(),
      examId: activeExam.id,
      studentName: name,
      studentClass: studentClass,
      answers: currentAnswers,
      score: score,
      totalQuestions: activeExam.questions.length,
      timestamp: Date.now()
    };

    StorageService.saveSubmission(submission);
    setLastSubmission(submission);
    setStep('result');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (step === 'result' && activeExam && lastSubmission) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg border-t-4 border-indigo-600">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Exam Submitted!</h2>
          <p className="text-gray-500">Thank you for completing {activeExam.title}</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-8 text-center">
          <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Your Score</p>
          <p className="text-4xl font-bold text-indigo-600 mt-2">
            {lastSubmission.score} <span className="text-gray-400 text-2xl">/ {lastSubmission.totalQuestions}</span>
          </p>
        </div>

        {activeExam.config.showAnswersAfter && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-2">Review Answers</h3>
            {activeExam.questions.map((q, idx) => {
              const userAnswer = lastSubmission.answers[idx];
              const isCorrect = userAnswer === q.correctOptionIndex;
              return (
                <div key={q.id} className={`p-4 rounded border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <p className="font-medium mb-2"><span className="text-gray-500">{idx + 1}.</span> {q.text}</p>
                  <div className="space-y-1 ml-4 text-sm">
                    {q.options.map((opt, optIdx) => {
                        let style = "text-gray-600";
                        if (optIdx === q.correctOptionIndex) style = "text-green-700 font-bold flex items-center gap-1";
                        else if (optIdx === userAnswer && !isCorrect) style = "text-red-700 font-bold line-through";
                        
                        return (
                            <p key={optIdx} className={style}>
                                {opt}
                                {optIdx === q.correctOptionIndex && <CheckCircle size={14} />}
                                {optIdx === userAnswer && !isCorrect && <XCircle size={14} />}
                            </p>
                        )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => {
                setStep('entry');
                setActiveExam(null);
                setExamCode('');
                setLastSubmission(null);
            }} 
            className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Take Another Exam
          </button>
        </div>
      </div>
    );
  }

  if (step === 'exam' && activeExam) {
    return (
      <div className="max-w-4xl mx-auto pb-24">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white shadow-md z-40 p-4 -mx-4 sm:mx-0 sm:rounded-b-lg mb-6 flex justify-between items-center border-t-4 border-indigo-600">
          <div>
            <h2 className="font-bold text-lg text-gray-800">{activeExam.title}</h2>
            <p className="text-sm text-gray-500">Student: {name}</p>
          </div>
          <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-indigo-600'}`}>
            <Clock size={24} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="space-y-6">
          {activeExam.questions.map((q, idx) => (
            <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium mb-4 flex gap-2">
                <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {idx + 1}
                </span>
                {q.text}
              </h3>
              <div className="space-y-3 pl-10">
                {q.options.map((opt, optIdx) => (
                  <label key={optIdx} className={`flex items-center p-3 rounded border cursor-pointer transition-all ${currentAnswers[idx] === optIdx ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={currentAnswers[idx] === optIdx}
                      onChange={() => handleAnswerSelect(idx, optIdx)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-center z-40 shadow-lg">
           <button
             onClick={() => {
                if(window.confirm("Are you sure you want to submit your exam?")) {
                    handleSubmitExam();
                }
             }}
             className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-indigo-700 transform hover:scale-105 transition-all w-full md:w-auto"
           >
             Submit Exam
           </button>
        </div>
      </div>
    );
  }

  // Step: Entry
  return (
    <div className="max-w-md mx-auto mt-10">
       <button onClick={onLogout} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 flex items-center gap-1">
            <LogOut size={16} /> Exit
        </button>
      <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
            <p className="text-gray-500 mt-2">Enter your details to start the exam</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Code</label>
            <input
              type="text"
              value={examCode}
              onChange={(e) => setExamCode(e.target.value.toUpperCase())}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase tracking-widest text-center font-bold"
              placeholder="Ex: AB12CD"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <input
              type="text"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Grade 10-A"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded text-sm flex items-start gap-2">
                <XCircle size={16} className="mt-0.5 shrink-0" />
                {error}
            </div>
          )}

          <button
            onClick={handleJoinExam}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition mt-2 shadow-md hover:shadow-lg"
          >
            Start Exam
          </button>
        </div>
      </div>
    </div>
  );
};