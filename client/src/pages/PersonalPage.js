import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useLanguage } from '../context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faTimesCircle, 
  faCheckCircle, 
  faRunning, 
  faFlagCheckered,
  faUser,
  faFlag,
  faSignInAlt,
  faCampground
} from '@fortawesome/free-solid-svg-icons';
import '../styles/Personal.scss';

// 模拟营地数据 - 后续将从合约获取
const mockCampsData = [
  // 用户创建的营地
  {
    id: "camp1",
    name: "Web3开发者训练营",
    status: "running",
    signupDeadline: "2023-10-10",
    challenges: 15,
    participants: 12,
    date: "2023-09-25",
    type: "created"
  },
  {
    id: "camp2",
    name: "Solidity智能合约大师班",
    status: "signup",
    signupDeadline: "2023-12-20",
    challenges: 20,
    participants: 5,
    date: "2023-12-01",
    type: "created"
  },
  {
    id: "camp3",
    name: "NFT创作与发行训练营",
    status: "completed",
    signupDeadline: "2023-09-30",
    challenges: 10,
    participants: 3,
    date: "2023-09-15",
    type: "created"
  },
  
  // 用户参与的营地
  {
    id: "camp4",
    name: "区块链安全攻防训练营",
    status: "running",
    signupDeadline: "2023-11-15",
    challenges: 12,
    participants: 18,
    date: "2023-10-20",
    type: "participated"
  },
  {
    id: "camp5",
    name: "DeFi协议开发实战",
    status: "success",
    signupDeadline: "2023-12-01",
    challenges: 18,
    participants: 8,
    date: "2023-11-05",
    type: "participated"
  },
  {
    id: "camp6",
    name: "DAO组织治理与管理",
    status: "completed",
    signupDeadline: "2023-08-25",
    challenges: 8,
    participants: 15,
    date: "2023-08-10",
    type: "participated"
  },
  {
    id: "camp7",
    name: "零知识证明入门与实践",
    status: "running",
    signupDeadline: "2023-11-30",
    challenges: 25,
    participants: 22,
    date: "2023-11-10",
    type: "participated"
  },
  {
    id: "camp8",
    name: "元宇宙开发入门",
    status: "signup",
    signupDeadline: "2024-01-15",
    challenges: 14,
    participants: 7,
    date: "2023-12-25",
    type: "participated"
  },
  
  // 可参与的营地
  {
    id: "camp9",
    name: "Web3全栈开发训练营",
    status: "signup",
    signupDeadline: "2024-01-15",
    challenges: 30,
    participants: 7,
    date: "2023-12-25",
    type: "available"
  },
  {
    id: "camp10",
    name: "智能合约安全审计",
    status: "signup",
    signupDeadline: "2023-12-30",
    challenges: 12,
    participants: 9,
    date: "2023-12-10",
    type: "available"
  },
  {
    id: "camp11",
    name: "DApp开发实战",
    status: "signup",
    signupDeadline: "2024-01-10",
    challenges: 18,
    participants: 12,
    date: "2023-12-20",
    type: "available"
  },
  {
    id: "camp12",
    name: "区块链游戏开发",
    status: "signup",
    signupDeadline: "2024-01-20",
    challenges: 22,
    participants: 5,
    date: "2023-12-28",
    type: "available"
  }
];

const PersonalPage = () => {
  const navigate = useNavigate();
  const { account, isConnected, connectWallet } = useWeb3();
  const { language, toggleLanguage } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('created');
  const [campsData, setCampsData] = useState([]);
  const [filteredCamps, setFilteredCamps] = useState([]);

  // 状态图标映射
  const statusIconMap = {
    "signup": faUserPlus,
    "failed": faTimesCircle,
    "success": faCheckCircle,
    "running": faRunning,
    "completed": faFlagCheckered
  };
  
  // 状态名称映射
  const statusNameMap = {
    "signup": language === 'zh' ? "报名开始" : "Signup Open",
    "failed": language === 'zh' ? "开营失败" : "Failed to Start",
    "success": language === 'zh' ? "开营成功" : "Started Successfully",
    "running": language === 'zh' ? "闯关模式" : "Challenge Mode",
    "completed": language === 'zh' ? "已结营" : "Completed"
  };

  // 初始化加载营地数据
  useEffect(() => {
    // 这里将来会从合约获取数据
    // 目前使用模拟数据
    setCampsData(mockCampsData);
    filterCamps(activeTab);
  }, []);

  // 当activeTab变化时，过滤营地
  useEffect(() => {
    filterCamps(activeTab);
  }, [activeTab, campsData]);

  // 过滤营地数据
  const filterCamps = (type) => {
    const filtered = campsData.filter(camp => camp.type === type);
    
    // 按报名截止日期倒序排列
    const sorted = [...filtered].sort((a, b) => 
      new Date(b.signupDeadline) - new Date(a.signupDeadline)
    );
    
    setFilteredCamps(sorted);
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 处理标签页切换
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // 处理点击营地卡片
  const handleCampClick = (campId) => {
    navigate(`/camp/${campId}`);
  };

  // 处理语言切换
  const handleLanguageToggle = () => {
    toggleLanguage();
  };

  // 获取空状态消息
  const getEmptyMessage = () => {
    if (activeTab === 'created') {
      return language === 'zh' 
        ? "您还没有发起任何营地，点击右上角按钮创建新营地" 
        : "You haven't created any camps yet, click the button in the top right to create a new camp";
    } else if (activeTab === 'participated') {
      return language === 'zh'
        ? "您尚未参与任何营地，快去发现并加入您感兴趣的营地吧"
        : "You haven't participated in any camps yet, go discover and join camps that interest you";
    } else {
      return language === 'zh'
        ? "当前没有可参与的营地，请稍后再来查看"
        : "There are no available camps at the moment, please check back later";
    }
  };

  return (
    <div className="personal-page">
      {/* 背景装饰元素 */}
      <div className="background-elements">
        <div className="bg-element bg-red"></div>
        <div className="bg-element bg-purple"></div>
      </div>
      
      {/* 顶部导航栏 */}
      <nav className="navbar">
        <div className="logo" onClick={() => navigate('/')}>FTW<span>.gold</span></div>
        <div className="user-menu">
          <div className="language-switcher">
            <button className="lang-btn" onClick={handleLanguageToggle}>
              {language === 'zh' ? 'EN' : '中文'}
            </button>
          </div>
          <button className="user-btn">
            <FontAwesomeIcon icon={faUser} />
          </button>
        </div>
      </nav>
      
      {/* 主容器 */}
      <div className="container">
        {/* 用户资料区 */}
        <div className="profile-section">
          <div className="avatar">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div className="user-info">
            <h1>{language === 'zh' ? "挑战者007" : "Challenger007"}</h1>
            <p>{account || "0x7429F1b9cD45e67fE8c4d8c6b7a89c4D1"}</p>
          </div>
        </div>
        
        {/* 标签页导航 */}
        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'created' ? 'active' : ''}`}
            onClick={() => handleTabChange('created')}
          >
            <FontAwesomeIcon icon={faFlag} /> {language === 'zh' ? "发起" : "Created"}
            <span className="count">{campsData.filter(camp => camp.type === 'created').length}</span>
          </div>
          <div 
            className={`tab ${activeTab === 'participated' ? 'active' : ''}`}
            onClick={() => handleTabChange('participated')}
          >
            <FontAwesomeIcon icon={faRunning} /> {language === 'zh' ? "已参与" : "Participated"}
            <span className="count">{campsData.filter(camp => camp.type === 'participated').length}</span>
          </div>
          <div 
            className={`tab ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => handleTabChange('available')}
          >
            <FontAwesomeIcon icon={faSignInAlt} /> {language === 'zh' ? "可参与" : "Available"}
            <span className="count">{campsData.filter(camp => camp.type === 'available').length}</span>
          </div>
        </div>
        
        {/* 营地卡片网格 */}
        <div className="camps-grid">
          {filteredCamps.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faCampground} />
              <h3>{language === 'zh' ? "没有找到营地" : "No camps found"}</h3>
              <p>{getEmptyMessage()}</p>
            </div>
          ) : (
            filteredCamps.map(camp => (
              <div 
                key={camp.id} 
                className={`camp-card ${camp.status}`}
                onClick={() => handleCampClick(camp.id)}
              >
                <h2>{camp.name}</h2>
                <div className="camp-date">
                  {language === 'zh' ? "报名截止: " : "Deadline: "}
                  {formatDate(camp.signupDeadline)}
                </div>
                <div className="status-indicator">
                  <FontAwesomeIcon icon={statusIconMap[camp.status]} />
                  <div className="status-tooltip">{statusNameMap[camp.status]}</div>
                </div>
                <div className="camp-footer">
                  <div>
                    <div className="value">{camp.challenges}</div>
                    <div className="label">
                      {language === 'zh' ? "关卡总数" : "Challenges"}
                    </div>
                  </div>
                  <div>
                    <div className="value">{camp.participants}</div>
                    <div className="label">
                      {language === 'zh' ? "已报名人数" : "Participants"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalPage; 