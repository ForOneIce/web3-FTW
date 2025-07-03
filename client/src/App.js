import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateCampPage from './pages/CreateCampPage';
import CampDetailPage from './pages/CampDetailPage';
import CreateLevelPage from './pages/CreateLevelPage';
import LevelDetailPage from './pages/LevelDetailPage';
import CampsPage from './pages/CampsPage';
import PersonalPage from './pages/PersonalPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* 未来将会添加更多路由 */}
      <Route path="/create-camp" element={<CreateCampPage />} />
      <Route path="/camps" element={<CampsPage />} />
      <Route path="/camp/:campId" element={<CampDetailPage />} />
      <Route path="/create-level/:campId" element={<CreateLevelPage />} />
      <Route path="/level/:campId" element={<LevelDetailPage />} />
      <Route path="/personal" element={<PersonalPage />} />
      <Route path="*" element={<div>404 页面未找到</div>} />
    </Routes>
  );
};

export default App; 