import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Common/Sidebar';
import Header from '../components/Common/Header';
import TeacherHome from '../components/Teacher/TeacherHome';
import TeacherVirtualClass from '../components/TeacherVirtualClass';
import QuizManagement from '../components/Teacher/QuizManagement';
import AllocatedSubjects from '../components/Teacher/AllocatedSubjects';
import ClassManagement from '../components/Teacher/ClassManagement';
import PerformanceAnalysis from '../components/Teacher/PerformanceAnalysis';
import Profile from '../components/Common/Profile';

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = (pathname) => {
    const routes = {
      '/teacher': t('dashboard'),
      '/teacher/virtual-class': t('virtualClass'),
      '/teacher/quiz': t('quizSetup'),
      '/teacher/subjects': t('allocatedSubjects'),
      '/teacher/students': t('classManagement'),
      '/teacher/performance': t('performanceAnalysis'),
      '/teacher/profile': t('profile')
    };
    return routes[pathname] || t('dashboard');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        userRole="teacher" 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          title={getPageTitle(window.location.pathname)}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route index element={<TeacherHome />} />
            <Route path="virtual-class" element={<TeacherVirtualClass />} />
            <Route path="quiz" element={<QuizManagement />} />
            <Route path="subjects" element={<AllocatedSubjects />} />
            <Route path="students" element={<ClassManagement />} />
            <Route path="performance" element={<PerformanceAnalysis />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;