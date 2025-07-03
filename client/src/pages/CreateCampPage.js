import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useLanguage } from '../context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar from '../components/Navbar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/CreateCamp.scss';

const CreateCampPage = () => {
  const navigate = useNavigate();
  const { isConnected, connect, account } = useWeb3();
  const { language } = useLanguage();
  
  // 表单状态
  const [campName, setCampName] = useState('');
  const [signupDeadline, setSignupDeadline] = useState(getTomorrowDate());
  const [campEndDate, setCampEndDate] = useState(getOneWeekLaterDate());
  const [challengeCount, setChallengeCount] = useState(5);
  const [minParticipants, setMinParticipants] = useState(5);
  const [maxParticipants, setMaxParticipants] = useState(20);
  const [depositAmount, setDepositAmount] = useState('100000000000000000');
  
  // 错误状态
  const [errors, setErrors] = useState({
    name: '',
    signupDeadline: '',
    campEndDate: '',
    challengeCount: '',
    minParticipants: '',
    maxParticipants: '',
    depositAmount: ''
  });
  
  // 确认弹窗状态
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // 钱包连接弹窗状态
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // 检查钱包连接状态，未连接时重定向到首页
  useEffect(() => {
    if (!isConnected) {
      // 如果页面刚加载且钱包未连接，显示钱包连接弹窗
      setShowWalletModal(true);
    }
  }, []);
  
  // 监听钱包连接状态变化
  useEffect(() => {
    if (!isConnected && showConfirmModal) {
      // 如果在确认过程中钱包断开，关闭确认弹窗并显示钱包连接弹窗
      setShowConfirmModal(false);
      setShowWalletModal(true);
    }
  }, [isConnected, showConfirmModal]);
  
  // 获取明天日期
  function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  // 获取一周后日期
  function getOneWeekLaterDate() {
    const oneWeekLater = new Date();
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    return oneWeekLater;
  }
  
  // 格式化日期为YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // 格式化WEI显示
  function formatWei(wei) {
    return Number(wei).toLocaleString();
  }
  
  // 表单验证
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      signupDeadline: '',
      campEndDate: '',
      challengeCount: '',
      minParticipants: '',
      maxParticipants: '',
      depositAmount: ''
    };
    
    // 验证钱包连接状态
    if (!isConnected) {
      setShowWalletModal(true);
      return false;
    }
    
    // 验证营地名称
    if (!campName) {
      newErrors.name = language === 'zh' ? "营地名称不能为空" : "Camp name is required";
      isValid = false;
    } else if (campName.length > 64) {
      newErrors.name = language === 'zh' ? "名称长度不能超过64个字符" : "Name cannot exceed 64 characters";
      isValid = false;
    } else if (/[^a-zA-Z0-9\u4e00-\u9fa5\s]/.test(campName)) {
      newErrors.name = language === 'zh' ? "名称包含非法字符" : "Name contains invalid characters";
      isValid = false;
    }
    
    // 验证报名截止日期
    if (!signupDeadline) {
      newErrors.signupDeadline = language === 'zh' ? "请选择报名截止日期" : "Please select signup deadline";
      isValid = false;
    }
    
    // 验证结营时间
    if (!campEndDate) {
      newErrors.campEndDate = language === 'zh' ? "请选择结营时间" : "Please select camp end date";
      isValid = false;
    } else if (campEndDate < signupDeadline) {
      newErrors.campEndDate = language === 'zh' ? "结营时间不能早于报名截止日期" : "End date cannot be earlier than signup deadline";
      isValid = false;
    }
    
    // 验证挑战关卡
    if (!challengeCount || challengeCount < 1) {
      newErrors.challengeCount = language === 'zh' ? "关卡数量必须大于0" : "Challenge count must be greater than 0";
      isValid = false;
    }
    
    // 验证参与者数量
    if (!minParticipants || minParticipants < 1) {
      newErrors.minParticipants = language === 'zh' ? "最小参与者数量必须大于0" : "Minimum participants must be greater than 0";
      isValid = false;
    }
    
    if (!maxParticipants || maxParticipants < 1) {
      newErrors.maxParticipants = language === 'zh' ? "最大参与者数量必须大于0" : "Maximum participants must be greater than 0";
      isValid = false;
    }
    
    if (parseInt(minParticipants) > parseInt(maxParticipants)) {
      newErrors.minParticipants = language === 'zh' ? "最小值不能大于最大值" : "Minimum cannot be greater than maximum";
      newErrors.maxParticipants = language === 'zh' ? "最大值不能小于最小值" : "Maximum cannot be less than minimum";
      isValid = false;
    }
    
    // 验证押金
    if (!depositAmount || parseInt(depositAmount) < 1) {
      newErrors.depositAmount = language === 'zh' ? "押金金额必须大于0" : "Deposit amount must be greater than 0";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // 提交表单
  const handleSubmit = () => {
    if (!isConnected) {
      setShowWalletModal(true);
      return;
    }
    
    if (validateForm()) {
      setShowConfirmModal(true);
    } else {
      // 滚动到第一个错误
      const firstErrorField = Object.keys(errors).find(key => errors[key] !== '');
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  // 确认创建
  const handleConfirm = async () => {
    // 再次验证钱包连接状态
    if (!isConnected) {
      setShowConfirmModal(false);
      setShowWalletModal(true);
      return;
    }
    
    try {
      // 这里应该是与合约交互的代码
      alert(language === 'zh' ? '营地创建成功！合约已部署，正在跳转到营地详情...' : 'Camp created successfully! Contract deployed, redirecting to camp details...');
      // 跳转到营地详情页面
      navigate('/camp-details');
    } catch (error) {
      console.error('创建营地失败:', error);
    }
  };
  
  // 连接钱包
  const handleConnectWallet = async () => {
    try {
      await connect();
      setShowWalletModal(false);
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  };
  
  // 页面离开提示
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // 检查表单是否有数据
      if (campName || challengeCount !== 5 || minParticipants !== 5 || maxParticipants !== 20 || depositAmount !== '100000000000000000') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [campName, challengeCount, minParticipants, maxParticipants, depositAmount]);
  
  // 自定义日期选择器样式
  const CustomDatePickerInput = React.forwardRef(({ value, onClick, placeholder, disabled }, ref) => (
    <div className="custom-datepicker-wrapper">
      <input
        className="form-control"
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        readOnly
        disabled={disabled}
        ref={ref}
      />
      <FontAwesomeIcon 
        icon="calendar-alt" 
        className="calendar-icon" 
        onClick={disabled ? undefined : onClick}
      />
    </div>
  ));
  
  return (
    <div className="create-camp-container">
      {/* 使用全局导航栏组件 */}
      <Navbar />
      
      {/* 主容器 */}
      <div className="container">
        <div className="form-header">
          <h1>{language === 'zh' ? '创建新营地' : 'Create New Camp'}</h1>
          <p>
            {language === 'zh' 
              ? '配置您的挑战营地，设置规则并招募志同道合的伙伴。所有字段均为必填项。' 
              : 'Configure your challenge camp, set rules and recruit like-minded partners. All fields are required.'}
          </p>
          
          {/* 钱包连接状态提示 */}
          {!isConnected && (
            <div className="wallet-status-warning">
              <FontAwesomeIcon icon="exclamation-triangle" />
              <p>
                {language === 'zh' 
                  ? '请先连接钱包，创建营地需要授权操作' 
                  : 'Please connect your wallet first. Creating a camp requires authorization.'}
              </p>
              <button className="connect-wallet-btn" onClick={handleConnectWallet}>
                {language === 'zh' ? '连接钱包' : 'Connect Wallet'}
              </button>
            </div>
          )}
        </div>
        
        <form className="camp-form">
          {/* 营地名称 */}
          <div className="form-group">
            <label htmlFor="name">
              <FontAwesomeIcon icon="flag" />
              {language === 'zh' ? '营地名称' : 'Camp Name'}
            </label>
            <input 
              type="text" 
              id="name" 
              className={`form-control ${errors.name ? 'invalid' : ''}`} 
              placeholder={language === 'zh' ? '输入营地名称（最多64个字符）' : 'Enter camp name (max 64 characters)'}
              value={campName}
              onChange={(e) => setCampName(e.target.value)}
              disabled={!isConnected}
            />
            <div className="error-message">{errors.name}</div>
          </div>
          
          {/* 日期选择器 - 报名截止日期 */}
          <div className="form-group">
            <label htmlFor="signupDeadline">
              <FontAwesomeIcon icon="calendar-alt" />
              {language === 'zh' ? '报名截止日期' : 'Signup Deadline'}
            </label>
            <DatePicker
              id="signupDeadline"
              selected={signupDeadline}
              onChange={(date) => setSignupDeadline(date)}
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
              className={errors.signupDeadline ? 'invalid' : ''}
              disabled={!isConnected}
              customInput={
                <CustomDatePickerInput 
                  placeholder={language === 'zh' ? '选择报名截止日期' : 'Select signup deadline'}
                  disabled={!isConnected}
                />
              }
            />
            <div className="error-message">{errors.signupDeadline}</div>
          </div>
          
          {/* 日期选择器 - 结营时间 */}
          <div className="form-group">
            <label htmlFor="campEndDate">
              <FontAwesomeIcon icon="calendar-check" />
              {language === 'zh' ? '结营时间' : 'Camp End Date'}
            </label>
            <DatePicker
              id="campEndDate"
              selected={campEndDate}
              onChange={(date) => setCampEndDate(date)}
              minDate={signupDeadline}
              dateFormat="yyyy-MM-dd"
              className={errors.campEndDate ? 'invalid' : ''}
              disabled={!isConnected}
              customInput={
                <CustomDatePickerInput 
                  placeholder={language === 'zh' ? '选择结营时间' : 'Select camp end date'}
                  disabled={!isConnected}
                />
              }
            />
            <div className="error-message">{errors.campEndDate}</div>
          </div>
          
          {/* 挑战关卡总数 */}
          <div className="form-group">
            <label htmlFor="challengeCount">
              <FontAwesomeIcon icon="mountain" />
              {language === 'zh' ? '挑战关卡总数' : 'Challenge Count'}
            </label>
            <input 
              type="number" 
              id="challengeCount" 
              className={`form-control ${errors.challengeCount ? 'invalid' : ''}`} 
              placeholder={language === 'zh' ? '输入关卡数量' : 'Enter challenge count'}
              min="1" 
              value={challengeCount}
              onChange={(e) => setChallengeCount(e.target.value)}
              disabled={!isConnected}
            />
            <div className="error-message">{errors.challengeCount}</div>
          </div>
          
          {/* 参与者数量范围 */}
          <div className="range-container">
            <div className="form-group">
              <label htmlFor="minParticipants">
                <FontAwesomeIcon icon="users" />
                {language === 'zh' ? '最小参与者数量' : 'Min Participants'}
              </label>
              <input 
                type="number" 
                id="minParticipants" 
                className={`form-control ${errors.minParticipants ? 'invalid' : ''}`} 
                placeholder={language === 'zh' ? '最小值' : 'Minimum'}
                min="1" 
                value={minParticipants}
                onChange={(e) => setMinParticipants(e.target.value)}
                disabled={!isConnected}
              />
              <div className="error-message">{errors.minParticipants}</div>
            </div>
            
            <div className="form-group">
              <label htmlFor="maxParticipants">
                <FontAwesomeIcon icon="users" />
                {language === 'zh' ? '最大参与者数量' : 'Max Participants'}
              </label>
              <input 
                type="number" 
                id="maxParticipants" 
                className={`form-control ${errors.maxParticipants ? 'invalid' : ''}`} 
                placeholder={language === 'zh' ? '最大值' : 'Maximum'}
                min="1" 
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                disabled={!isConnected}
              />
              <div className="error-message">{errors.maxParticipants}</div>
            </div>
          </div>
          
          {/* 预付押金金额 */}
          <div className="form-group">
            <label htmlFor="depositAmount">
              <FontAwesomeIcon icon="coins" />
              {language === 'zh' ? '预付押金金额 (WEI)' : 'Deposit Amount (WEI)'}
            </label>
            <input 
              type="text" 
              id="depositAmount" 
              className={`form-control ${errors.depositAmount ? 'invalid' : ''}`} 
              placeholder={language === 'zh' ? '输入押金金额' : 'Enter deposit amount'}
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              disabled={!isConnected}
            />
            <div className="error-message">{errors.depositAmount}</div>
          </div>
          
          {/* 提交按钮 - 与首页方形按钮保持一致 */}
          <div className="submit-btn-container">
            <button 
              type="button" 
              className={`square-btn left ${!isConnected ? 'disabled' : ''}`} 
              onClick={handleSubmit}
              disabled={!isConnected}
            >
              <div className="icon">
                <FontAwesomeIcon icon={isConnected ? "check-circle" : "lock"} />
              </div>
              <h2>
                {isConnected 
                  ? (language === 'zh' ? '确认创建' : 'Create Camp')
                  : (language === 'zh' ? '需要连接钱包' : 'Wallet Required')}
              </h2>
            </button>
          </div>
        </form>
      </div>
      
      {/* 确认弹窗 - 与首页钱包弹窗保持一致 */}
      <div className={`wallet-modal ${showConfirmModal ? 'active' : ''}`}>
        <div className="modal-content">
          <h2>{language === 'zh' ? '确认营地信息' : 'Confirm Camp Info'}</h2>
          <p>
            {language === 'zh' 
              ? '请仔细检查营地配置信息，确认无误后提交到区块链' 
              : 'Please check the camp configuration carefully before submitting to blockchain'}
          </p>
          
          {/* 显示创建者钱包地址 */}
          <div className="creator-info">
            <span>{language === 'zh' ? '创建者钱包地址:' : 'Creator Address:'}</span>
            <span>{account}</span>
          </div>
          
          <div className="camp-details">
            <div>
              <span>{language === 'zh' ? '营地名称:' : 'Camp Name:'}</span>
              <span>{campName}</span>
            </div>
            <div>
              <span>{language === 'zh' ? '报名截止:' : 'Signup Deadline:'}</span>
              <span>{signupDeadline.toLocaleDateString()}</span>
            </div>
            <div>
              <span>{language === 'zh' ? '结营时间:' : 'End Date:'}</span>
              <span>{campEndDate.toLocaleDateString()}</span>
            </div>
            <div>
              <span>{language === 'zh' ? '挑战关卡:' : 'Challenges:'}</span>
              <span>{challengeCount} {language === 'zh' ? '关' : ''}</span>
            </div>
            <div>
              <span>{language === 'zh' ? '参与者数量:' : 'Participants:'}</span>
              <span>{minParticipants} - {maxParticipants} {language === 'zh' ? '人' : ''}</span>
            </div>
            <div>
              <span>{language === 'zh' ? '押金金额:' : 'Deposit:'}</span>
              <span>{formatWei(depositAmount)} WEI</span>
            </div>
          </div>
          
          <div className="modal-buttons">
            <button 
              className="cancel-btn" 
              onClick={() => setShowConfirmModal(false)}
            >
              {language === 'zh' ? '取消' : 'Cancel'}
            </button>
            <button 
              className="close-btn" 
              onClick={handleConfirm}
            >
              {language === 'zh' ? '确认创建' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
      
      {/* 钱包连接弹窗 */}
      <div className={`wallet-modal ${showWalletModal ? 'active' : ''}`}>
        <div className="modal-content">
          <h2>{language === 'zh' ? '需要连接钱包' : 'Wallet Required'}</h2>
          <p>
            {language === 'zh' 
              ? '创建营地需要连接钱包进行授权，请先连接您的钱包' 
              : 'Creating a camp requires wallet authorization. Please connect your wallet first.'}
          </p>
          
          <div className="wallet-options">
            <div className="wallet-option" onClick={handleConnectWallet}>
              <FontAwesomeIcon icon={["fab", "ethereum"]} />
              <h3>MetaMask</h3>
            </div>
            <div className="wallet-option" onClick={handleConnectWallet}>
              <FontAwesomeIcon icon="wallet" />
              <h3>WalletConnect</h3>
            </div>
          </div>
          
          <div className="modal-buttons">
            <button 
              className="cancel-btn" 
              onClick={() => {
                setShowWalletModal(false);
                navigate('/');
              }}
            >
              {language === 'zh' ? '返回首页' : 'Back to Home'}
            </button>
            <button 
              className="close-btn" 
              onClick={() => setShowWalletModal(false)}
            >
              {language === 'zh' ? '稍后连接' : 'Connect Later'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampPage; 