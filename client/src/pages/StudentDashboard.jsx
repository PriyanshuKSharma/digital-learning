import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Common/Sidebar';
import Header from '../components/Common/Header';
import StudentHome from '../components/Student/StudentHome';
import StudentVirtualClass from '../components/StudentVirtualClass';
import Materials from '../components/Student/Materials';
import AITutor from '../components/Student/AITutor';
import CodeEditor from '../components/Student/CodeEditor';
import Profile from '../components/Common/Profile';

const StudentDashboard = () => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = (pathname) => {
    const routes = {
      '/student': t('dashboard'),
      '/student/class': t('virtualClass'),
      '/student/materials': t('materials'),
      '/student/ai-tutor': t('aiTutor'),
      '/student/code-editor': t('virtualCodeEditor'),
      '/student/profile': t('profile')
    };
    return routes[pathname] || t('dashboard');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        userRole="student" 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          title={getPageTitle(window.location.pathname)}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route index element={<StudentHome />} />
            <Route path="class" element={<StudentVirtualClass />} />
            <Route path="materials" element={<Materials />} />
            <Route path="ai-tutor" element={<AITutor />} />
            <Route path="code-editor" element={<CodeEditor />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;