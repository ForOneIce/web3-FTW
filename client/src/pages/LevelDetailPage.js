import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faRunning, faKey, faCheckCircle, 
  faClock, faCheck, faLock, faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Navbar';
import { useWeb3 } from '../context/Web3Context';
import { useLanguage } from '../context/LanguageContext';
import { formatAddress } from '../utils/web3';
import '../styles/LevelDetail.scss';

// 引入FontAwesome图标库
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(
  faArrowLeft, faRunning, faKey, faCheckCircle, 
  faClock, faCheck, faLock, faExclamationTriangle
);

const LevelDetailPage = () => {
  const { campId } = useParams();
  const navigate = useNavigate();
  const { isConnected, address } = useWeb3();
  const { language } = useLanguage();
  
  // 状态
  const [camp, setCamp] = useState(null);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'submit', 'success'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 模拟数据
  useEffect(() => {
    const fetchLevelData = async () => {
      try {
        setLoading(true);
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟营地数据
        const mockCampData = {
          id: campId || "camp-001",
          name: language === 'zh' ? "Web3开发者训练营" : "Web3 Developer Camp",
          totalLevels: 15,
          currentLevelIndex: 3, // 当前进行到第3关
          contract: "0x7b2F9a1B3cD45e67fE8c4d8c6b7a89c4D19eA3",
          creator: "0x8a3F2b1cD45e67fE8c4d8c6b7a89c4D1"
        };
        
        // 生成关卡数据
        const mockLevels = [];
        for (let i = 1; i <= mockCampData.totalLevels; i++) {
          // 计算截止日期 - 每周一个关卡
          const baseDate = new Date('2025-09-15');
          baseDate.setDate(baseDate.getDate() + (i * 7));
          const deadline = baseDate.toISOString().split('T')[0];
          
          // 计算剩余天数
          const today = new Date();
          const deadlineDate = new Date(deadline);
          const diffTime = deadlineDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // 关卡状态
          let status = 'pending'; // 待解锁
          let passedCount = 0;
          
          if (i < mockCampData.currentLevelIndex) {
            status = 'completed'; // 已完成
            passedCount = Math.floor(Math.random() * 5) + 8; // 8-12人通过
          } else if (i === mockCampData.currentLevelIndex) {
            status = 'active'; // 当前关卡
            passedCount = 3; // 当前关卡3人通过
          }
          
          mockLevels.push({
            id: `level-${i}`,
            number: i,
            deadline: deadline,
            remainingDays: diffDays,
            status: status,
            passedCount: passedCount,
            totalParticipants: 12
          });
        }
        
        // 模拟参与者数据
        const participantNames = [
          "区块链探索者", "智能合约大师", "去中心化先锋", "Web3开发者", 
          "加密艺术家", "共识算法研究员", "DeFi专家", "NFT收藏家", 
          "DAO架构师", "零知识证明专家", "链上数据分析师", "元宇宙建造师"
        ];
        
        const mockParticipants = [];
        for (let i = 0; i < 12; i++) {
          const randomAddr = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
          
          mockParticipants.push({
            id: `p${i+1}`,
            name: participantNames[i],
            address: randomAddr,
            completed: i < 3 // 前3个已完成当前关卡
          });
        }
        
        // 设置加载的数据
        setCamp(mockCampData);
        setLevels(mockLevels);
        setCurrentLevel(mockLevels.find(l => l.number === mockCampData.currentLevelIndex));
        setParticipants(mockParticipants);
        
        // 模拟是否为创建者
        setIsCreator(address && mockCampData.creator.toLowerCase() === address.toLowerCase());
        
        // 模拟是否已参加
        setHasJoined(true); // 假设已参加
        
        // 模拟已完成的关卡
        setCompletedLevels([1, 2]); // 已完成第1和第2关
        
        setLoading(false);
      } catch (err) {
        console.error("获取关卡数据错误:", err);
        setError("获取数据失败，请稍后重试");
        setLoading(false);
      }
    };

    fetchLevelData();
  }, [campId, language, address]);

  // 处理返回
  const handleBack = () => {
    navigate(`/camp/${campId}`);
  };

  // 打开模态框
  const openModal = (type) => {
    setActiveModal(type);
    if (type === 'submit') {
      setPasswordInput('');
      setPasswordError('');
    }
  };

  // 关闭模态框
  const closeModal = () => {
    setActiveModal(null);
  };

  // 处理密码输入变化
  const handlePasswordChange = (e) => {
    setPasswordInput(e.target.value);
    setPasswordError('');
  };

  // 处理提交密文
  const handleSubmitPassword = async () => {
    if (!passwordInput.trim()) {
      setPasswordError(language === 'zh' ? "请输入通关密文" : "Please enter the password");
      return;
    }
    
    try {
      // 模拟验证过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟验证成功
      closeModal();
      
      // 更新已完成关卡
      if (currentLevel && !completedLevels.includes(currentLevel.number)) {
        setCompletedLevels([...completedLevels, currentLevel.number]);
      }
      
      // 更新参与者状态
      const updatedParticipants = participants.map(p => {
        if (address && p.address.toLowerCase() === address.toLowerCase()) {
          return { ...p, completed: true };
        }
        return p;
      });
      setParticipants(updatedParticipants);
      
      // 显示成功弹窗
      setTimeout(() => {
        openModal('success');
      }, 500);
    } catch (err) {
      console.error("验证密文错误:", err);
      setPasswordError(language === 'zh' ? "验证失败，请检查密文是否正确" : "Verification failed, please check your password");
    }
  };

  // 计算进度
  const calculateProgress = () => {
    if (!camp) return 0;
    return (completedLevels.length / camp.totalLevels) * 100;
  };

  // 渲染关卡行
  const renderLevelRow = (level) => {
    const isActive = level.status === 'active';
    const isCompleted = level.status === 'completed' || completedLevels.includes(level.number);
    const isPending = level.status === 'pending';
    const isExpired = level.remainingDays < 0 && !isCompleted;
    
    let nodeClass = "black-key-node";
    if (isActive) nodeClass += " active";
    if (isCompleted) nodeClass += " completed";
    if (isExpired) nodeClass += " expired";
    
    return (
      <div className="piano-row" key={level.id}>
        <div className={nodeClass}>
          <h2>{language === 'zh' ? `关卡 ${level.number}` : `Level ${level.number}`}</h2>
        </div>
        <div className="white-key">
          <h3>{language === 'zh' ? "截止时间" : "Deadline"}</h3>
          <div className="value">{level.deadline}</div>
          <div className="label">
            {level.remainingDays > 0 
              ? (language === 'zh' ? `剩余 ${level.remainingDays} 天` : `${level.remainingDays} days left`)
              : (language === 'zh' ? "已结束" : "Ended")}
          </div>
        </div>
        <div className="white-key">
          <h3>{language === 'zh' ? "通过人数" : "Passed"}</h3>
          <div className="value">
            {isPending ? "0" : `${level.passedCount}/${level.totalParticipants}`}
          </div>
          <div className="label">
            {isPending 
              ? (language === 'zh' ? "未解锁" : "Locked") 
              : (language === 'zh' ? "已通关人数" : "Completed")}
          </div>
        </div>
        <div className="white-key">
          {isActive ? (
            <>
              <h3>{language === 'zh' ? "通关操作" : "Action"}</h3>
              {isCreator ? (
                <div className="value">{language === 'zh' ? "组织者无需闯关" : "Creator cannot challenge"}</div>
              ) : !hasJoined ? (
                <div className="value">{language === 'zh' ? "未参与此营地" : "Not joined"}</div>
              ) : completedLevels.includes(level.number) ? (
                <button className="action-btn completed" disabled>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  {language === 'zh' ? "已通关" : "Completed"}
                </button>
              ) : isExpired ? (
                <button className="action-btn expired" disabled>
                  <FontAwesomeIcon icon={faClock} />
                  {language === 'zh' ? "已过期" : "Expired"}
                </button>
              ) : (
                <button className="action-btn" onClick={() => openModal('submit')}>
                  <FontAwesomeIcon icon={faKey} />
                  {language === 'zh' ? "提交通关密文" : "Submit Password"}
                </button>
              )}
              {!completedLevels.includes(level.number) && !isExpired && !isCreator && hasJoined && (
                <div className="label">{language === 'zh' ? "提交后不可更改" : "Cannot change after submit"}</div>
              )}
            </>
          ) : isCompleted ? (
            <>
              <h3>{language === 'zh' ? "您的状态" : "Your Status"}</h3>
              <div className="value" style={{ color: '#4CAF50' }}>
                {language === 'zh' ? "已通关" : "Completed"}
              </div>
              <div className="label">2025-09-25</div>
            </>
          ) : (
            <>
              <h3>{language === 'zh' ? "状态" : "Status"}</h3>
              <div className="value">
                {isPending 
                  ? (language === 'zh' ? "未解锁" : "Locked") 
                  : (language === 'zh' ? "进行中" : "In Progress")}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // 渲染提交密文模态框
  const renderSubmitModal = () => (
    <div className={`modal ${activeModal === 'submit' ? 'active' : ''}`}>
      <div className="modal-content">
        <h2>{language === 'zh' ? "提交通关密文" : "Submit Password"}</h2>
        <p>
          {language === 'zh' 
            ? "请输入您获得的通关密文进行验证" 
            : "Please enter your challenge password for verification"}
        </p>
        
        <div className="camp-details">
          <div>
            <span>{language === 'zh' ? "关卡名称:" : "Level Name:"}</span>
            <span>
              {camp?.name} - {language === 'zh' ? `关卡${currentLevel?.number}` : `Level ${currentLevel?.number}`}
            </span>
          </div>
          <div>
            <span>{language === 'zh' ? "截止日期:" : "Deadline:"}</span>
            <span>{currentLevel?.deadline}</span>
          </div>
          <div>
            <span>{language === 'zh' ? "合约地址:" : "Contract Address:"}</span>
            <span>{formatAddress(camp?.contract)}</span>
          </div>
          <div>
            <span>{language === 'zh' ? "网络费用:" : "Network Fee:"}</span>
            <span>≈ 0.001 ETH</span>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="passwordInput">{language === 'zh' ? "通关密文" : "Password"}</label>
          <input 
            type="text" 
            id="passwordInput" 
            className="form-control" 
            placeholder={language === 'zh' ? "输入通关密文" : "Enter password"}
            value={passwordInput}
            onChange={handlePasswordChange}
          />
          <div className="error-message">{passwordError}</div>
        </div>
        
        <div className="modal-buttons">
          <button className="modal-btn cancel-btn" onClick={closeModal}>
            {language === 'zh' ? "取消" : "Cancel"}
          </button>
          <button className="modal-btn confirm-btn" onClick={handleSubmitPassword}>
            {language === 'zh' ? "提交验证" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );

  // 渲染验证成功模态框
  const renderSuccessModal = () => (
    <div className={`modal ${activeModal === 'success' ? 'active' : ''}`}>
      <div className="modal-content">
        <div style={{ fontSize: '5rem', color: '#FFD700', marginBottom: '1.5rem' }}>
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>
        <h2>{language === 'zh' ? "验证成功！" : "Verification Success!"}</h2>
        <p>
          {language === 'zh' 
            ? `恭喜您成功通过第${currentLevel?.number}关！` 
            : `Congratulations on passing Level ${currentLevel?.number}!`}
        </p>
        
        <div className="camp-details">
          <div>
            <span>{language === 'zh' ? "通关时间:" : "Completion Time:"}</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
          <div>
            <span>{language === 'zh' ? "交易哈希:" : "Transaction Hash:"}</span>
            <span>0x3aF2b...c4D1</span>
          </div>
        </div>
        
        <div className="modal-buttons">
          <button className="modal-btn confirm-btn" onClick={closeModal}>
            {language === 'zh' ? "确认" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="level-detail-container">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{language === 'zh' ? "加载中..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="level-detail-container">
        <Navbar />
        <div className="error-container">
          <h2>{language === 'zh' ? "出错了" : "Error"}</h2>
          <p>{error}</p>
          <button className="action-btn" onClick={() => window.location.reload()}>
            {language === 'zh' ? "重试" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="level-detail-container">
      <Navbar />
      
      <div className="container">
        {/* 简化的页面标题区域 */}
        <div className="level-header">
          {/* 只保留关卡挑战标题 */}
          <h1 className="challenge-title">{language === 'zh' ? "关卡挑战" : "Level Challenge"}</h1>
        </div>
        
        {/* 返回按钮 */}
        <button className="back-btn" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          {language === 'zh' ? "返回营地" : "Back to Camp"}
        </button>
        
        {/* 进度条 */}
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        
        <div className="progress-labels">
          <div className="progress-label">
            {language === 'zh' ? "已完成: " : "Completed: "}
            <span className="progress-value">{completedLevels.length}/{camp?.totalLevels}</span>
          </div>
          <div className="progress-label">
            {language === 'zh' ? "当前关卡: " : "Current Level: "}
            <span className="progress-value">
              {language === 'zh' ? `第 ${currentLevel?.number} 关` : `Level ${currentLevel?.number}`}
            </span>
          </div>
        </div>
        
        {/* 钢琴键盘容器 */}
        <div className="piano-container">
          <div className="piano">
            {levels.map(level => renderLevelRow(level))}
          </div>
        </div>
        
        {/* 参与者列表 */}
        <div className="participants-section">
          <h2 className="section-title">
            {language === 'zh' ? "本关卡参与者状态" : "Participants Status"}
          </h2>
          <div className="participants-grid">
            {participants.map(participant => (
              <div 
                key={participant.id} 
                className={`participant-card ${participant.completed ? 'completed' : ''}`}
              >
                <div className="participant-avatar">{participant.name.charAt(0)}</div>
                <div className="participant-name">{participant.name}</div>
                <div className="participant-address">
                  {formatAddress(participant.address)}
                </div>
                <div className={`level-status ${participant.completed ? 'status-completed' : 'status-pending'}`}>
                  {participant.completed 
                    ? <><FontAwesomeIcon icon={faCheckCircle} /> {language === 'zh' ? "已通关" : "Completed"}</>
                    : <><FontAwesomeIcon icon={faClock} /> {language === 'zh' ? "进行中" : "In Progress"}</>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 模态框 */}
      {renderSubmitModal()}
      {renderSuccessModal()}
    </div>
  );
};

export default LevelDetailPage; 