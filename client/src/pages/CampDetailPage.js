import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faRunning, faCoins, faHandHoldingUsd, faPlay, faCheck, faLock, faExclamationTriangle, faCheckCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Navbar';
import { useWeb3 } from '../context/Web3Context';
import { useLanguage } from '../context/LanguageContext';
import { formatAddress } from '../utils/web3';
import '../styles/CampDetail.scss';

// 引入FontAwesome图标库
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(faArrowLeft, faRunning, faCoins, faHandHoldingUsd, faPlay, faCheck, faLock, faExclamationTriangle, faCheckCircle, faClock);

// 营地状态枚举
const CAMP_STATUS = {
  SIGNUP: 'signup',      // 报名中
  FAILED: 'failed',      // 开营失败
  OPENED: 'opened',      // 开营成功
  CHALLENGE: 'challenge', // 闯关中
  COMPLETED: 'completed'  // 已结束
};

const CampDetailPage = () => {
  const { campId } = useParams();
  const navigate = useNavigate();
  const { isConnected, address } = useWeb3();
  const { language } = useLanguage();
  
  // 状态
  const [camp, setCamp] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'join', 'refund', 'start', 'challenge', 'penalty'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 模拟营地数据
  useEffect(() => {
    const fetchCampData = async () => {
      try {
        setLoading(true);
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟数据 - 根据不同状态创建不同的示例数据
        // 实际项目中应通过API或合约获取真实数据
        const mockCampData = {
          id: campId || "camp-001",
          name: language === 'zh' ? "Web3开发者训练营 - 2025秋季" : "Web3 Developer Camp - Fall 2025",
          status: CAMP_STATUS.COMPLETED, // 设置为结营状态
          signupDeadline: "2025-10-10",
          campStart: "2025-10-15",
          campEnd: "2025-12-30",
          minParticipants: 10,
          maxParticipants: 20,
          currentParticipants: 12, // 达到开营要求
          completedParticipants: 9, // 通关人数
          failedParticipants: 3, // 未通关人数
          challenges: 15,
          deposit: "0.1", // ETH
          creator: "0x8a3F2b1cD45e67fE8c4d8c6b7a89c4D1",
          contract: "0x7b2F9a1B3cD45e67fE8c4d8c6b7a89c4D19eA3",
          refundStatus: 'pending', // 初始化退款状态: pending, processing, completed
          createdAt: "2025-09-25"
        };
        
        // 根据选择的状态调整一些数据
        if (mockCampData.status === CAMP_STATUS.FAILED) {
          mockCampData.currentParticipants = 8; // 低于最低要求
        } else if (mockCampData.status === CAMP_STATUS.OPENED) {
          mockCampData.currentParticipants = 12; // 达到开营要求
        } else if (mockCampData.status === CAMP_STATUS.CHALLENGE) {
          mockCampData.currentParticipants = 12;
          mockCampData.currentLevel = 3;
        } else if (mockCampData.status === CAMP_STATUS.COMPLETED) {
          mockCampData.currentParticipants = 12;
          mockCampData.completedParticipants = 9;
          mockCampData.failedParticipants = 3;
          mockCampData.rewardsDistributed = true; // 奖励是否已发放
          mockCampData.rewardsDate = "2025-12-31"; // 奖励发放日期
        }
        
        // 模拟参与者数据
        const mockParticipants = [
          { id: "p1", name: "区块链探索者", address: "0x3aF2b1cD45e67fE8c4d8c6b7a89c4D1" },
          { id: "p2", name: "智能合约大师", address: "0x5b9F1b9cD45e67fE8c4d8c6b7a89c4D1" },
          { id: "p3", name: "去中心化先锋", address: "0x8c2F9a1B3cD45e67fE8c4d8c6b7a89c4D1" }
        ];
        
        // 根据状态生成不同数量的参与者
        const participantCount = mockCampData.currentParticipants;
        
        // 生成足够数量的参与者
        const participantNames = [
          "区块链探索者", "智能合约大师", "去中心化先锋", "Web3开发者", 
          "加密艺术家", "共识算法研究员", "DeFi专家", "NFT收藏家", 
          "DAO架构师", "零知识证明专家", "链上数据分析师", "元宇宙建造师"
        ];
        
        const participantList = [];
        for (let i = 0; i < participantCount; i++) {
          const randomAddr = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
          
          let participant = {
            id: `p${i+1}`,
            name: participantNames[i % participantNames.length],
            address: randomAddr
          };
          
          // 为闯关模式添加进度
          if (mockCampData.status === CAMP_STATUS.CHALLENGE) {
            // 随机生成当前关卡和完成关卡数，但确保有一些变化
            const maxLevel = Math.min(mockCampData.currentLevel + 1, mockCampData.challenges);
            const minLevel = Math.max(1, mockCampData.currentLevel - 2);
            participant.currentLevel = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
            
            // 完成的关卡数不能超过当前关卡减1
            participant.completedLevels = participant.currentLevel > 1 ? participant.currentLevel - 1 : 0;
            
            // 确保有一些参与者进度领先，一些落后
            if (i < 3) {
              participant.currentLevel = mockCampData.currentLevel + 1;
              participant.completedLevels = mockCampData.currentLevel;
            } else if (i >= participantCount - 3) {
              participant.currentLevel = Math.max(1, mockCampData.currentLevel - 1);
              participant.completedLevels = Math.max(0, participant.currentLevel - 1);
            }
          }
          
          // 为结营模式添加完成状态
          if (mockCampData.status === CAMP_STATUS.COMPLETED) {
            participant.completed = i < mockCampData.completedParticipants;
            participant.refunded = participant.completed && Math.random() > 0.5; // 随机设置一些已完成的参与者已退款
          }
          
          participantList.push(participant);
        }
        
        // 设置加载的数据
        setCamp(mockCampData);
        setParticipants(participantList);
        
        // 模拟是否为创建者
        setIsCreator(address && mockCampData.creator.toLowerCase() === address.toLowerCase());
        
        // 模拟是否已参加
        setHasJoined(participantList.some(p => address && p.address.toLowerCase() === address.toLowerCase()));
        
        setLoading(false);
      } catch (err) {
        console.error("获取营地数据错误:", err);
        setError("获取数据失败，请稍后重试");
        setLoading(false);
      }
    };

    fetchCampData();
  }, [campId, language, address]);
  
  // 获取当前阶段
  const getCurrentStage = () => {
    if (!camp) return null;
    
    switch (camp.status) {
      case CAMP_STATUS.SIGNUP:
        return { stage: 2, name: language === 'zh' ? "报名开始" : "Registration" };
      case CAMP_STATUS.FAILED:
        return { stage: 3, name: language === 'zh' ? "开营情况" : "Camp Status" };
      case CAMP_STATUS.OPENED:
        return { stage: 3, name: language === 'zh' ? "开营情况" : "Camp Status" };
      case CAMP_STATUS.CHALLENGE:
        return { stage: 4, name: language === 'zh' ? "闯关模式" : "Challenge Mode" };
      case CAMP_STATUS.COMPLETED:
        return { stage: 5, name: language === 'zh' ? "结营" : "Completed" };
      default:
        return { stage: 2, name: language === 'zh' ? "报名开始" : "Registration" };
    }
  };
  
  // 打开模态框
  const openModal = (type) => {
    setActiveModal(type);
  };
  
  // 关闭模态框
  const closeModal = () => {
    setActiveModal(null);
  };
  
  // 处理报名
  const handleJoin = async () => {
    if (!isConnected) {
      alert(language === 'zh' ? "请先连接钱包" : "Please connect wallet first");
      return;
    }
    
    try {
      // 实际项目中这里应该调用合约方法
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新状态
      setHasJoined(true);
      setCamp(prev => ({...prev, currentParticipants: prev.currentParticipants + 1}));
      
      // 添加当前用户到参与者列表
      setParticipants([
        ...participants, 
        {
          id: `p${participants.length + 1}`,
          name: "新参与者",
          address
        }
      ]);
      
      closeModal();
      alert(language === 'zh' ? "报名成功！" : "Successfully joined!");
    } catch (err) {
      console.error("报名出错:", err);
      alert(language === 'zh' ? "报名失败，请重试" : "Failed to join, please try again");
    }
  };
  
  // 处理开启关卡
  const handleStartLevel = async () => {
    try {
      // 关闭模态框
      closeModal();
      
      // 跳转到配置关卡页面
      navigate(`/create-level/${camp.id}`);
    } catch (err) {
      console.error("开启关卡出错:", err);
      alert(language === 'zh' ? "开启关卡失败，请重试" : "Failed to start levels, please try again");
    }
  };
  
  // 处理退款
  const handleRefund = async () => {
    try {
      // 关闭模态框
      closeModal();
      
      // 显示处理中状态
      // 在实际项目中这里应该调用合约方法
      // 更新UI以显示处理中状态
      const updatedCamp = { ...camp, refundStatus: 'processing' };
      setCamp(updatedCamp);
      
      // 模拟区块链交易处理时间
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 更新状态
      if (camp.status === CAMP_STATUS.FAILED) {
        // 失败状态下，所有人都能获得退款
        setParticipants(participants.map(p => ({...p, refunded: true})));
        // 更新营地退款状态
        setCamp({ ...camp, refundStatus: 'completed' });
      } else if (camp.status === CAMP_STATUS.COMPLETED) {
        // 完成状态下，只有通关的人能获得退款
        const updatedParticipants = participants.map(p => {
          if (p.completed) {
            return {...p, refunded: true};
          }
          return p;
        });
        setParticipants(updatedParticipants);
        // 更新营地退款状态
        setCamp({ ...camp, refundStatus: 'completed' });
      }
      
      alert(language === 'zh' ? "押金退还成功！所有参与者押金已返还。" : "Refund successful! All participant deposits have been returned.");
    } catch (err) {
      console.error("退款出错:", err);
      // 恢复原始状态
      setCamp({ ...camp, refundStatus: 'pending' });
      alert(language === 'zh' ? "退款失败，请重试" : "Refund failed, please try again");
    }
  };
  
  // 处理罚款
  const handlePenalty = async () => {
    try {
      // 实际项目中这里应该调用合约方法
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新状态
      const updatedParticipants = participants.map(p => {
        if (!p.completed) {
          return {...p, refunded: true, penalized: true};
        }
        return p;
      });
      setParticipants(updatedParticipants);
      
      closeModal();
      alert(language === 'zh' ? "罚款操作完成！" : "Penalty action completed!");
    } catch (err) {
      console.error("罚款出错:", err);
      alert(language === 'zh' ? "罚款操作失败，请重试" : "Penalty action failed, please try again");
    }
  };
  
  // 处理闯关按钮点击
  const handleChallenge = () => {
    navigate(`/level/${campId}`);
  };
  
  // 渲染钢琴键节点
  const renderPianoNode = (stage, name, isActive) => (
    <div className={`black-key-node ${isActive ? 'active' : ''}`}>
      <h2>{name}</h2>
    </div>
  );
  
  // 渲染状态徽章
  const renderStatusBadge = () => {
    if (!camp) return null;
    
    let badgeClass = '';
    let statusText = '';
    
    switch (camp.status) {
      case CAMP_STATUS.SIGNUP:
        statusText = language === 'zh' ? "报名进行中" : "Registration Open";
        break;
      case CAMP_STATUS.FAILED:
        statusText = language === 'zh' ? "开营失败" : "Camp Failed";
        badgeClass = 'fail-status';
        break;
      case CAMP_STATUS.OPENED:
        statusText = language === 'zh' ? "开营成功" : "Camp Started";
        badgeClass = 'success-status';
        break;
      case CAMP_STATUS.CHALLENGE:
        statusText = language === 'zh' ? "闯关模式" : "Challenge Mode";
        badgeClass = 'fighting-status';
        break;
      case CAMP_STATUS.COMPLETED:
        statusText = language === 'zh' ? "结营成功" : "Camp Completed";
        badgeClass = 'success-status';
        break;
      default:
        statusText = language === 'zh' ? "未知状态" : "Unknown Status";
    }
    
    return <div className={`status-badge ${badgeClass}`}>{statusText}</div>;
  };
  
  // 渲染当前状态的消息横幅
  const renderStatusBanner = () => {
    if (!camp) return null;
    
    switch (camp.status) {
      case CAMP_STATUS.FAILED:
        return (
          <div className="status-banner failure-banner">
            <h3>
              <FontAwesomeIcon icon="exclamation-triangle" style={{marginRight: '10px'}} />
              {language === 'zh' ? "开营失败原因" : "Failure Reason"}
            </h3>
            <p>
              {language === 'zh' 
                ? `本次营地报名人数为 ${camp.currentParticipants} 人，未达到最低开营人数要求（${camp.minParticipants}人）。根据营地规则，押金将退还给所有已报名参与者。`
                : `This camp has ${camp.currentParticipants} participants, which is below the minimum requirement of ${camp.minParticipants}. According to camp rules, deposits will be refunded to all registered participants.`}
            </p>
          </div>
        );
      case CAMP_STATUS.OPENED:
        return (
          <div className="status-banner success-banner">
            <FontAwesomeIcon icon="check-circle" style={{fontSize: '2rem', color: '#4CAF50'}} />
            <h3>
              {language === 'zh' 
                ? `本次营地报名人数达到 ${camp.currentParticipants} 人，已成功开启！`
                : `The camp has reached ${camp.currentParticipants} participants and has successfully started!`}
            </h3>
          </div>
        );
      case CAMP_STATUS.CHALLENGE:
        return (
          <div className="status-banner challenge-banner">
            <FontAwesomeIcon icon="running" style={{fontSize: '2rem', color: '#ff9800'}} />
            <h3>
              {language === 'zh' 
                ? `挑战已经开始，当前进行到第 ${camp.currentLevel} 关，共 ${camp.challenges} 关！`
                : `Challenge has started! Current level: ${camp.currentLevel} of ${camp.challenges} levels!`}
            </h3>
          </div>
        );
      default:
        return null;
    }
  };
  
  // 渲染参与者列表
  const renderParticipants = () => {
    if (!camp || !participants.length) return null;
    
    let title = '';
    switch (camp.status) {
      case CAMP_STATUS.SIGNUP:
      case CAMP_STATUS.OPENED:
        title = language === 'zh' ? "已报名参与者" : "Registered Participants";
        break;
      case CAMP_STATUS.FAILED:
      case CAMP_STATUS.COMPLETED:
        title = language === 'zh' ? "参与者押金状态" : "Participant Deposit Status";
        break;
      case CAMP_STATUS.CHALLENGE:
        title = language === 'zh' ? "参与者进度" : "Participant Progress";
        break;
    }
    
    // 在闯关模式下按完成关卡数排序
    let sortedParticipants = [...participants];
    if (camp.status === CAMP_STATUS.CHALLENGE) {
      sortedParticipants.sort((a, b) => 
        b.completedLevels - a.completedLevels || b.currentLevel - a.currentLevel);
    }
    
    // 在结营状态下，先显示已完成的参与者，再显示未完成的
    if (camp.status === CAMP_STATUS.COMPLETED) {
      sortedParticipants.sort((a, b) => {
        if (a.completed && !b.completed) return -1;
        if (!a.completed && b.completed) return 1;
        return 0;
      });
    }
    
    return (
      <div className="participants-section">
        <h2 className="section-title">{title}</h2>
        <div className="participants-grid">
          {sortedParticipants.map(participant => (
            <div 
              key={participant.id}
              className={`participant-card ${participant.refunded ? 'refunded' : ''} ${participant.completed ? 'completed' : ''} ${participant.completed === false ? 'failed' : ''}`}
            >
              <div className="participant-avatar">
                {participant.name.charAt(0)}
              </div>
              <div className="participant-name">{participant.name}</div>
              <div className="participant-address">
                {formatAddress(participant.address)}
              </div>
              
              {camp.status === CAMP_STATUS.CHALLENGE && (
                <div className="participant-progress">
                  {language === 'zh' ? "关卡: " : "Level: "}
                  {participant.currentLevel} | 
                  {language === 'zh' ? " 完成: " : " Completed: "}
                  {participant.completedLevels}
                </div>
              )}
              
              {camp.status === CAMP_STATUS.FAILED && (
                <div className={`refund-status ${participant.refunded ? 'status-refunded' : 'status-pending'}`}>
                  {participant.refunded 
                    ? <><FontAwesomeIcon icon="check-circle" /> {language === 'zh' ? " 已退还" : " Refunded"}</>
                    : <><FontAwesomeIcon icon="clock" /> {language === 'zh' ? " 待退还" : " Pending"}</>}
                </div>
              )}
              
              {camp.status === CAMP_STATUS.COMPLETED && participant.completed && (
                <div className={`refund-status ${participant.refunded ? 'status-refunded' : 'status-pending'}`}>
                  {participant.refunded 
                    ? <><FontAwesomeIcon icon="check-circle" /> {language === 'zh' ? " 已赎回" : " Refunded"}</>
                    : <><FontAwesomeIcon icon="clock" /> {language === 'zh' ? " 待赎回" : " Pending"}</>}
                </div>
              )}
              
              {camp.status === CAMP_STATUS.COMPLETED && !participant.completed && (
                <div className="refund-status status-penalized">
                  <FontAwesomeIcon icon="exclamation-triangle" /> {language === 'zh' ? " 未通关" : " Failed"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // 渲染关卡进度（闯关模式）
  const renderLevelProgress = () => {
    if (!camp || camp.status !== CAMP_STATUS.CHALLENGE) return null;
    
    const progressPercent = ((camp.currentLevel - 1) / camp.challenges) * 100;
    
    return (
      <div className="participants-section">
        <h2 className="section-title">
          {language === 'zh' ? "关卡进度" : "Level Progress"}
        </h2>
        <div className="progress-container">
          <div className="progress-bar" style={{width: `${progressPercent}%`}}></div>
        </div>
        <div style={{textAlign: 'center', margin: '10px 0', fontSize: '1.2rem'}}>
          {language === 'zh' ? "已完成 " : "Completed "}
          <span id="completedLevels">{camp.currentLevel - 1}</span>/
          <span id="totalLevels">{camp.challenges}</span>
          {language === 'zh' ? " 关" : " levels"}
        </div>
        <div className="levels-container">
          {Array.from({length: camp.challenges}).map((_, i) => {
            const level = i + 1;
            let cardClass = '';
            
            if (level < camp.currentLevel) {
              cardClass = 'completed';
            } else if (level === camp.currentLevel) {
              cardClass = 'current';
            } else {
              cardClass = 'locked';
            }
            
            return (
              <div className={`level-card ${cardClass}`} key={level}>
                {level < camp.currentLevel ? <FontAwesomeIcon icon="check" /> : 
                 level > camp.currentLevel ? <FontAwesomeIcon icon="lock" /> : level}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // 渲染结营统计（已结束状态）
  const renderCompletionStats = () => {
    if (!camp || camp.status !== CAMP_STATUS.COMPLETED) return null;
    
    // 根据用户身份和完成状态确定按钮状态
    const canClaimRefund = hasJoined && participants.find(p => 
      p.address.toLowerCase() === address?.toLowerCase())?.completed && !participants.find(p => 
      p.address.toLowerCase() === address?.toLowerCase())?.refunded;
    
    const canApplyPenalty = isCreator && camp.failedParticipants > 0 && 
      participants.some(p => !p.completed && !p.penalized);
    
    return (
      <div className="results-stats">
        <div className="stat-card success">
          <div className="stat-value">{camp.completedParticipants}</div>
          <div className="stat-label">
            {language === 'zh' ? "通关人数" : "Completed"}
          </div>
          <button 
            className="refund-btn" 
            onClick={() => openModal('refund')}
            disabled={!canClaimRefund}
            style={{marginTop: '15px'}}
          >
            <FontAwesomeIcon icon="coins" />
            {hasJoined && participants.find(p => 
              p.address.toLowerCase() === address?.toLowerCase())?.refunded
              ? (language === 'zh' ? "已赎回" : "Refunded")
              : (language === 'zh' ? "押金赎回" : "Refund Deposit")}
          </button>
        </div>
        
        <div className="stat-card failure">
          <div className="stat-value">{camp.failedParticipants}</div>
          <div className="stat-label">
            {language === 'zh' ? "扣押人数" : "Failed"}
          </div>
          <button 
            className="penalty-btn" 
            onClick={() => openModal('penalty')}
            disabled={!canApplyPenalty}
            style={{marginTop: '15px'}}
          >
            <FontAwesomeIcon icon="hand-holding-usd" />
            {!isCreator
              ? (language === 'zh' ? "无操作权限" : "No Permission")
              : camp.failedParticipants === 0
                ? (language === 'zh' ? "无未通关者" : "No Failures")
                : participants.some(p => !p.completed && p.penalized)
                  ? (language === 'zh' ? "已罚扣" : "Penalized")
                  : (language === 'zh' ? "押金罚扣" : "Apply Penalty")}
          </button>
        </div>
      </div>
    );
  };
  
  // 渲染节点5：结营
  const renderNode5 = () => {
    const currentStage = getCurrentStage();
    const isActive = currentStage && currentStage.stage === 5;
    
    return (
      <div className="piano-row">
        {renderPianoNode(5, language === 'zh' ? "结营" : "Completion", isActive)}
        
        <div className="white-key">
          <h3>{language === 'zh' ? "结营时间" : "End Date"}</h3>
          <div className="value">
            {camp?.status === CAMP_STATUS.COMPLETED ? camp.campEnd : "-"}
          </div>
          <div className="label">
            {camp?.status !== CAMP_STATUS.COMPLETED && 
              (language === 'zh' ? "未发生" : "Not yet")}
            {camp?.status === CAMP_STATUS.CHALLENGE && 
              (language === 'zh' ? `剩余 ${Math.floor(Math.random() * 30) + 30} 天` : `${Math.floor(Math.random() * 30) + 30} days left`)}
          </div>
        </div>
        
        <div className="white-key">
          <h3>{language === 'zh' ? "完成率" : "Completion Rate"}</h3>
          <div className="value">
            {camp?.status === CAMP_STATUS.COMPLETED 
              ? `${Math.round((camp.completedParticipants / camp.currentParticipants) * 100)}%` 
              : "-"}
          </div>
          <div className="label">
            {camp?.status === CAMP_STATUS.COMPLETED 
              ? `${camp.completedParticipants}${language === 'zh' ? "人通关" : " completed"}` 
              : (language === 'zh' ? "等待数据" : "Pending")}
          </div>
        </div>
        
        <div className="white-key">
          <h3>{language === 'zh' ? "奖励发放" : "Rewards"}</h3>
          <div className="value">
            {camp?.status === CAMP_STATUS.COMPLETED 
              ? <span style={{color: '#4CAF50'}}>{language === 'zh' ? "已完成" : "Completed"}</span> 
              : "-"}
          </div>
          <div className="label">
            {camp?.status === CAMP_STATUS.COMPLETED 
              ? camp.rewardsDate || camp.campEnd  
              : (language === 'zh' ? "等待数据" : "Pending")}
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染节点4：闯关模式
  const renderNode4 = () => {
    const currentStage = getCurrentStage();
    const isActive = currentStage && currentStage.stage === 4;
    
    return (
      <div className="piano-row">
        {renderPianoNode(4, language === 'zh' ? "闯关模式" : "Challenge", isActive)}
        
        <div className="white-key">
          <h3>{language === 'zh' ? "挑战关卡" : "Challenges"}</h3>
          <div className="value">{camp?.challenges || 0}</div>
          <div className="label">{language === 'zh' ? "总关卡数" : "Total Levels"}</div>
        </div>
        
        <div className="white-key">
          <h3>{language === 'zh' ? "当前进度" : "Current Progress"}</h3>
          <div className="value">{camp?.currentLevel || 1}</div>
          <div className="label">{language === 'zh' ? "当前关卡" : "Current Level"}</div>
        </div>
        
        <div className="white-key">
          <h3>{language === 'zh' ? "操作" : "Action"}</h3>
          {isCreator ? (
            <div className="value">{language === 'zh' ? "组织者不可参与闯关" : "Creator cannot challenge"}</div>
          ) : !hasJoined ? (
            <div className="value">{language === 'zh' ? "未参与此营地" : "Not joined"}</div>
          ) : (
            <button 
              className="action-btn"
              onClick={handleChallenge}
            >
              <FontAwesomeIcon icon={faRunning} />
              {language === 'zh' ? "闯关" : "Challenge"}
            </button>
          )}
        </div>
      </div>
    );
  };
  
  // 渲染节点3：开营情况
  const renderNode3 = () => {
    const currentStage = getCurrentStage();
    const isActive = currentStage && currentStage.stage === 3;
    
    return (
      <div className="piano-row">
        {renderPianoNode(3, language === 'zh' ? "开营情况" : "Camp Status", isActive)}
        
        <div className="white-key">
          <h3>{language === 'zh' ? "开营状态" : "Camp Status"}</h3>
          <div className="value" style={camp?.status === CAMP_STATUS.FAILED ? {color: '#f44336'} : camp?.status !== CAMP_STATUS.SIGNUP ? {color: '#4CAF50'} : {}}>
            {camp?.status === CAMP_STATUS.SIGNUP && (language === 'zh' ? "等待开营" : "Waiting")}
            {camp?.status === CAMP_STATUS.FAILED && (language === 'zh' ? "开营失败" : "Failed")}
            {(camp?.status === CAMP_STATUS.OPENED || camp?.status === CAMP_STATUS.CHALLENGE || camp?.status === CAMP_STATUS.COMPLETED) && 
              (language === 'zh' ? "已开营" : "Started")}
          </div>
          <div className="label">
            {camp?.status === CAMP_STATUS.FAILED && (language === 'zh' ? "未达人数要求" : "Insufficient participants")}
            {camp?.status !== CAMP_STATUS.SIGNUP && camp?.status !== CAMP_STATUS.FAILED && camp?.campStart}
          </div>
        </div>
        
        {camp?.status === CAMP_STATUS.FAILED && (
          <div className="white-key">
            <h3>{language === 'zh' ? "押金状态" : "Deposit Status"}</h3>
            <div className="value" id="refundStatus" style={camp.refundStatus === 'completed' ? {color: '#4CAF50'} : {color: '#f44336'}}>
              {camp.refundStatus === 'completed' 
                ? (language === 'zh' ? `${camp.currentParticipants}人已退还` : `${camp.currentParticipants} refunded`)
                : (language === 'zh' ? `${camp.currentParticipants}人待退还` : `${camp.currentParticipants} pending refund`)}
            </div>
            <div className="label">
              {language === 'zh' ? `押金金额: ${camp.deposit} ETH` : `Deposit: ${camp.deposit} ETH`}
            </div>
          </div>
        )}
        
        {camp?.status === CAMP_STATUS.FAILED && (
          <div className="white-key">
            <h3>{language === 'zh' ? "押金操作" : "Deposit Action"}</h3>
            <button 
              className="refund-btn action-btn"
              onClick={() => openModal('refund')}
              disabled={!isCreator || camp.refundStatus === 'processing' || camp.refundStatus === 'completed'}
            >
              {camp.refundStatus === 'completed' 
                ? <><FontAwesomeIcon icon="check-circle" /> {language === 'zh' ? "已完成退还" : "Refund Completed"}</>
                : camp.refundStatus === 'processing'
                  ? <><FontAwesomeIcon icon="spinner" spin /> {language === 'zh' ? "处理中..." : "Processing..."}</>
                  : <><FontAwesomeIcon icon="coins" /> {language === 'zh' ? "退还押金" : "Refund Deposit"}</>}
            </button>
            <div className="label">
              {camp.refundStatus === 'completed'
                ? (language === 'zh' ? "押金已全部退还" : "All deposits refunded")
                : camp.refundStatus === 'processing'
                  ? (language === 'zh' ? "区块链交易处理中" : "Blockchain transaction processing")
                  : (language === 'zh' ? "组织者操作" : "Organizer action")}
            </div>
          </div>
        )}
        
        {camp?.status === CAMP_STATUS.OPENED && (
          <div className="white-key">
            <h3>{language === 'zh' ? "押金状态" : "Deposit Status"}</h3>
            <div className="value">
              {language === 'zh' ? `${camp.currentParticipants}人押金已提交` : `${camp.currentParticipants} deposits submitted`}
            </div>
            <div className="label">
              {language === 'zh' ? `押金金额: ${camp.deposit} ETH` : `Deposit: ${camp.deposit} ETH`}
            </div>
          </div>
        )}
        
        {camp?.status === CAMP_STATUS.OPENED && (
          <div className="white-key">
            <h3>{language === 'zh' ? "关卡操作" : "Level Action"}</h3>
            <button 
              id="startLevelBtn" 
              className="start-level-btn"
              onClick={() => openModal('start')}
              disabled={!isCreator}
            >
              <div className="icon">
                <FontAwesomeIcon icon="play" />
              </div>
              <h2>{language === 'zh' ? "开启关卡" : "Start Level"}</h2>
            </button>
            <div className="label">
              {isCreator 
                ? (language === 'zh' ? "组织者操作" : "Organizer action")
                : (language === 'zh' ? "无操作权限" : "No permission")}
            </div>
          </div>
        )}
        
        {camp?.status === CAMP_STATUS.CHALLENGE && (
          <div className="white-key">
            <h3>{language === 'zh' ? "押金状态" : "Deposit Status"}</h3>
            <div className="value">
              {language === 'zh' ? `${camp.currentParticipants}人押金锁定中` : `${camp.currentParticipants} deposits locked`}
            </div>
            <div className="label">
              {language === 'zh' ? `押金金额: ${camp.deposit} ETH` : `Deposit: ${camp.deposit} ETH`}
            </div>
          </div>
        )}
        
        {camp?.status === CAMP_STATUS.CHALLENGE && (
          <div className="white-key">
            <h3>{language === 'zh' ? "开营时间" : "Start Date"}</h3>
            <div className="value">{camp.campStart}</div>
            <div className="label">
              {language === 'zh' ? "已开始" : "Started"}
            </div>
          </div>
        )}
        
        {camp?.status === CAMP_STATUS.COMPLETED && (
          <div className="white-key">
            <h3>{language === 'zh' ? "押金状态" : "Deposit Status"}</h3>
            <div className="value">
              {language === 'zh' ? `${camp.currentParticipants}人押金锁定` : `${camp.currentParticipants} deposits locked`}
            </div>
            <div className="label">
              {language === 'zh' ? `押金金额: ${camp.deposit} ETH` : `Deposit: ${camp.deposit} ETH`}
            </div>
          </div>
        )}
        
        {camp?.status === CAMP_STATUS.COMPLETED && (
          <div className="white-key">
            <h3>{language === 'zh' ? "开营时间" : "Start Date"}</h3>
            <div className="value">{camp.campStart}</div>
          </div>
        )}
      </div>
    );
  };
  
  // 渲染节点2：报名开始
  const renderNode2 = () => {
    const currentStage = getCurrentStage();
    const isActive = currentStage && currentStage.stage === 2;
    
    return (
      <div className="piano-row">
        {renderPianoNode(2, language === 'zh' ? "报名开始" : "Registration", isActive)}
        
        <div className="white-key">
          <h3>{language === 'zh' ? "报名截止" : "Registration Deadline"}</h3>
          <div className="value">{camp?.signupDeadline}</div>
          <div className="label">
            {camp?.status === CAMP_STATUS.SIGNUP 
              ? (language === 'zh' ? "剩余 7 天" : "7 days left") 
              : (language === 'zh' ? "已结束" : "Ended")}
          </div>
        </div>
        
        <div className="white-key">
          <h3>{language === 'zh' ? "参与人数" : "Participants Range"}</h3>
          <div className="value">{camp?.minParticipants}-{camp?.maxParticipants}人</div>
          <div className="label">
            {language === 'zh' ? "下限-上限" : "Min-Max"}
          </div>
        </div>
        
        <div className="white-key">
          <h3>{language === 'zh' ? "已报名" : "Registered"}</h3>
          <div className="value">{camp?.currentParticipants}人</div>
          <div className="label">
            {camp?.status === CAMP_STATUS.FAILED
              ? (language === 'zh' ? "未达到开营要求" : "Below requirement")
              : camp?.status === CAMP_STATUS.SIGNUP
                ? (language === 'zh' ? "当前人数" : "Current count")
                : (language === 'zh' ? "达到开营要求" : "Requirements met")}
          </div>
        </div>
        
        {camp?.status === CAMP_STATUS.SIGNUP && (
          <div className="white-key">
            <h3>{language === 'zh' ? "参与营地" : "Join Camp"}</h3>
            <button 
              id="joinBtn" 
              className="action-btn"
              disabled={isCreator || hasJoined}
              onClick={() => openModal('join')}
            >
              <FontAwesomeIcon icon="running" />
              {language === 'zh' ? "立即报名" : "Join Now"}
            </button>
            <div className="label">
              {language === 'zh' ? `押金: ${camp.deposit} ETH` : `Deposit: ${camp.deposit} ETH`}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // 添加节点1：营地创建
  const renderNode1 = () => {
    return (
      <div className="piano-row">
        {renderPianoNode(1, language === 'zh' ? "营地创建" : "CampCreation", false)}
        
        <div className="white-key">
          <h3>{language === 'zh' ? "创建时间" : "Creation Date"}</h3>
          <div className="value">
            {camp?.createdAt || "2025-09-25"}
          </div>
        </div>
        
        <div className="white-key">
          <h3>{language === 'zh' ? "创建者" : "Creator"}</h3>
          <div className="value">
            {formatAddress(camp?.creator || "")}
          </div>
          <div className="label">
            {language === 'zh' ? "营地组织者" : "Camp Organizer"}
          </div>
        </div>
        
        <div className="white-key">
          <h3>{language === 'zh' ? "合约地址" : "Contract Address"}</h3>
          <div className="value">
            {formatAddress(camp?.contract || "")}
          </div>
        </div>
      </div>
    );
  };

  // 渲染加入模态框
  const renderJoinModal = () => {
    if (activeModal !== 'join') return null;
    
    return (
      <div className="modal active">
        <div className="modal-content">
          <h2>{language === 'zh' ? "支付押金" : "Pay Deposit"}</h2>
          <p>
            {language === 'zh' 
              ? "确认支付押金加入营地，完成挑战后可全额返还" 
              : "Confirm paying deposit to join the camp. Full refund after completing challenges."}
          </p>
          
          <div className="camp-details">
            <div>
              <span>{language === 'zh' ? "营地名称:" : "Camp Name:"}</span>
              <span>{camp?.name}</span>
            </div>
            <div>
              <span>{language === 'zh' ? "押金金额:" : "Deposit Amount:"}</span>
              <span>{camp?.deposit} ETH</span>
            </div>
            <div>
              <span>{language === 'zh' ? "合约地址:" : "Contract Address:"}</span>
              <span>{formatAddress(camp?.contract || "")}</span>
            </div>
          </div>
          
          <div className="modal-buttons">
            <button className="modal-btn cancel-btn" onClick={closeModal}>
              {language === 'zh' ? "取消" : "Cancel"}
            </button>
            <button className="modal-btn confirm-btn" onClick={handleJoin}>
              {language === 'zh' ? "确认支付" : "Confirm Payment"}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染退款模态框
  const renderRefundModal = () => {
    if (activeModal !== 'refund') return null;
    
    // 计算押金总额
    const totalDeposit = camp ? parseFloat(camp.deposit) : 0;
    
    // 根据营地状态显示不同的内容
    const title = camp?.status === CAMP_STATUS.COMPLETED 
      ? (language === 'zh' ? "押金赎回" : "Refund Deposit") 
      : (language === 'zh' ? "退还押金" : "Refund Deposits");
    
    const description = camp?.status === CAMP_STATUS.COMPLETED
      ? (language === 'zh' 
          ? "确认赎回您的押金？此操作将在区块链上执行" 
          : "Confirm refunding your deposit? This operation will be executed on the blockchain")
      : (language === 'zh' 
          ? "确认退还所有参与者的押金？此操作将在区块链上执行" 
          : "Confirm refunding deposits to all participants? This operation will be executed on the blockchain");
    
    return (
      <div className="modal active">
        <div className="modal-content">
          <h2>{title}</h2>
          <p>{description}</p>
          
          <div className="camp-details">
            <div>
              <span>{language === 'zh' ? "营地名称:" : "Camp Name:"}</span>
              <span>{camp?.name}</span>
            </div>
            
            {camp?.status === CAMP_STATUS.COMPLETED ? (
              <div>
                <span>{language === 'zh' ? "赎回金额:" : "Refund Amount:"}</span>
                <span>{totalDeposit.toFixed(1)} ETH</span>
              </div>
            ) : (
              <>
                <div>
                  <span>{language === 'zh' ? "押金总额:" : "Total Deposit:"}</span>
                  <span>{(totalDeposit * camp?.currentParticipants).toFixed(1)} ETH</span>
                </div>
                <div>
                  <span>{language === 'zh' ? "退还人数:" : "Refund Count:"}</span>
                  <span>{camp?.currentParticipants} {language === 'zh' ? "人" : ""}</span>
                </div>
              </>
            )}
            
            <div>
              <span>{language === 'zh' ? "合约地址:" : "Contract Address:"}</span>
              <span>{formatAddress(camp?.contract || "")}</span>
            </div>
            <div>
              <span>{language === 'zh' ? "网络费用:" : "Network Fee:"}</span>
              <span>≈ 0.002 ETH</span>
            </div>
          </div>
          
          <div className="modal-buttons">
            <button className="modal-btn cancel-btn" onClick={closeModal}>
              {language === 'zh' ? "取消" : "Cancel"}
            </button>
            <button className="modal-btn confirm-btn" onClick={handleRefund}>
              {camp?.status === CAMP_STATUS.COMPLETED
                ? (language === 'zh' ? "确认赎回" : "Confirm Refund")
                : (language === 'zh' ? "确认退还" : "Confirm Refund")}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染开始关卡模态框
  const renderStartLevelModal = () => {
    if (activeModal !== 'start') return null;
    
    return (
      <div className="modal active">
        <div className="modal-content">
          <h2>{language === 'zh' ? "开启关卡" : "Start Levels"}</h2>
          <p>
            {language === 'zh' 
              ? "确认开启关卡模式。此操作将锁定所有参与者押金，直到营地结束。" 
              : "Confirm starting the challenge levels. This action will lock all participant deposits until the camp ends."}
          </p>
          
          <div className="modal-buttons">
            <button className="modal-btn cancel-btn" onClick={closeModal}>
              {language === 'zh' ? "取消" : "Cancel"}
            </button>
            <button className="modal-btn confirm-btn" onClick={handleStartLevel}>
              {language === 'zh' ? "确认开启" : "Confirm Start"}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染罚款模态框
  const renderPenaltyModal = () => {
    if (activeModal !== 'penalty') return null;
    
    // 计算罚款总额
    const penaltyAmount = camp ? parseFloat(camp.deposit) * camp.failedParticipants : 0;
    
    return (
      <div className="modal active">
        <div className="modal-content">
          <h2>{language === 'zh' ? "押金罚扣" : "Apply Penalty"}</h2>
          <p>
            {language === 'zh' 
              ? `确认罚扣 ${camp?.failedParticipants || 0} 名未完成挑战的参与者押金。此操作不可撤销。` 
              : `Confirm applying penalty to ${camp?.failedParticipants || 0} participants who failed to complete the challenges. This action cannot be undone.`}
          </p>
          
          <div className="camp-details">
            <div>
              <span>{language === 'zh' ? "营地名称:" : "Camp Name:"}</span>
              <span>{camp?.name}</span>
            </div>
            <div>
              <span>{language === 'zh' ? "罚扣人数:" : "Penalty Count:"}</span>
              <span>{camp?.failedParticipants} {language === 'zh' ? "人" : ""}</span>
            </div>
            <div>
              <span>{language === 'zh' ? "罚扣总额:" : "Total Penalty:"}</span>
              <span>{penaltyAmount.toFixed(1)} ETH</span>
            </div>
            <div>
              <span>{language === 'zh' ? "合约地址:" : "Contract Address:"}</span>
              <span>{formatAddress(camp?.contract || "")}</span>
            </div>
            <div>
              <span>{language === 'zh' ? "网络费用:" : "Network Fee:"}</span>
              <span>≈ 0.003 ETH</span>
            </div>
          </div>
          
          <div className="modal-buttons">
            <button className="modal-btn cancel-btn" onClick={closeModal}>
              {language === 'zh' ? "取消" : "Cancel"}
            </button>
            <button className="modal-btn confirm-btn" onClick={handlePenalty}>
              {language === 'zh' ? "确认罚扣" : "Confirm Penalty"}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // 返回按钮处理
  const handleBack = () => {
    navigate("/");
  };

  // 主渲染函数
  if (loading) {
    return (
      <div className="camp-detail-container">
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
      <div className="camp-detail-container">
        <Navbar />
        <div className="error-container">
          <FontAwesomeIcon icon="exclamation-triangle" />
          <h2>{language === 'zh' ? "出错了" : "Error"}</h2>
          <p>{error}</p>
          <button onClick={handleBack} className="action-btn">
            <FontAwesomeIcon icon="arrow-left" />
            {language === 'zh' ? "返回首页" : "Back to Home"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="camp-detail-container">
      <Navbar />
      
      <div className="container">
        <div className="camp-header">
          <h1>{camp?.name}</h1>
          <p>
            {camp?.status === CAMP_STATUS.FAILED
              ? (language === 'zh' 
                  ? "很遗憾，本次营地未能成功开启，押金将退还给所有参与者" 
                  : "Unfortunately, this camp failed to start. Deposits will be refunded to all participants.")
              : camp?.status === CAMP_STATUS.CHALLENGE
                ? (language === 'zh'
                    ? "挑战已经开始，展现你的实力，完成所有关卡！"
                    : "The challenge has begun! Show your skills and complete all levels!")
                : camp?.status === CAMP_STATUS.COMPLETED
                  ? (language === 'zh'
                      ? "恭喜！本次营地已圆满结束，感谢所有参与者的付出"
                      : "Congratulations! This camp has successfully completed. Thank you to all participants.")
                  : (language === 'zh' 
                      ? "在通往区块链开发的路上，每一步都是新的突破。加入我们，共同成长！" 
                      : "On the road to blockchain development, each step is a breakthrough. Join us and grow together!")}
          </p>
          {renderStatusBadge()}
        </div>
        
        {renderStatusBanner()}
        
        <div className="piano-container">
          <div className="piano">
            {renderNode5()}
            {renderNode4()}
            {renderNode3()}
            {renderNode2()}
            {renderNode1()}
          </div>
        </div>
        
        {camp?.status === CAMP_STATUS.CHALLENGE && renderLevelProgress()}
        {camp?.status === CAMP_STATUS.COMPLETED && renderCompletionStats()}
        
        {renderParticipants()}
      </div>
      
      {/* 渲染各种模态框 */}
      {renderJoinModal()}
      {renderRefundModal()}
      {renderStartLevelModal()}
      {renderPenaltyModal()}
    </div>
  );
};

export default CampDetailPage;