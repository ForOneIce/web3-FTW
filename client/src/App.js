import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateCampPage from './pages/CreateCampPage';
import CampDetailPage from './pages/CampDetailPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* 未来将会添加更多路由 */}
      <Route path="/create-camp" element={<CreateCampPage />} />
      <Route path="/camps" element={<div>营地列表页面</div>} />
      <Route path="/camp/:campId" element={<CampDetailPage />} />
      <Route path="/profile" element={<div>个人空间页面</div>} />
      <Route path="*" element={<div>404 页面未找到</div>} />
    </Routes>
  );
};

export default App; 