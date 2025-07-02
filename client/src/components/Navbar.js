import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useLanguage } from '../context/LanguageContext';
import { formatAddress } from '../utils/web3';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const { isConnected, address, connect, disconnect } = useWeb3();
  
  const handleUserBtnClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleDisconnect = () => {
    disconnect();
    setIsMenuOpen(false);
  };
  
  // 点击其他地方关闭菜单
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      const userBtn = document.getElementById('userBtn');
      const dropdown = document.getElementById('dropdown');
      
      if (userBtn && dropdown && !userBtn.contains(e.target) && !dropdown.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        FTW<span>.gold</span>
      </Link>
      
      <div className="user-menu">
        <div className="language-switcher">
          <button className="lang-btn" onClick={toggleLanguage}>
            {language === 'zh' ? 'EN' : '中文'}
          </button>
        </div>
        
        <button id="userBtn" className="user-btn" onClick={handleUserBtnClick}>
          <i className="fas fa-user"></i>
        </button>
        
        <div id="dropdown" className={`dropdown ${isMenuOpen ? 'active' : ''}`}>
          <div className="dropdown-item">
            <i className="fas fa-wallet"></i>
            <div>
              <h4>{language === 'zh' ? '钱包' : 'Wallet'}</h4>
              {isConnected ? (
                <p>{formatAddress(address)}</p>
              ) : (
                <p onClick={() => connect()}>
                  {language === 'zh' ? '点击连接' : 'Connect'}
                </p>
              )}
            </div>
          </div>
          
          <Link to="/profile" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
            <i className="fas fa-user-circle"></i>
            <div>
              <h4>{language === 'zh' ? '个人空间' : 'Profile'}</h4>
            </div>
          </Link>
          
          {isConnected && (
            <div className="dropdown-item" onClick={handleDisconnect}>
              <i className="fas fa-sign-out-alt"></i>
              <div>
                <h4>{language === 'zh' ? '断开连接' : 'Disconnect'}</h4>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 