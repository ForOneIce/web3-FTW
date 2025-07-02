import React, { createContext, useContext, useState, useEffect } from 'react';
import { connectWallet, checkWalletConnection, setupWalletListeners } from '../utils/web3';

// 创建上下文
const Web3Context = createContext();

// 上下文提供者组件
export const Web3Provider = ({ children }) => {
  const [walletData, setWalletData] = useState({
    address: '',
    signer: null,
    networkId: null,
    isConnected: false,
    isLoading: true,
    error: null
  });

  // 初始化时检查钱包连接状态
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connection = await checkWalletConnection();
        setWalletData(prev => ({ 
          ...prev, 
          ...connection, 
          isLoading: false 
        }));
      } catch (error) {
        setWalletData(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message
        }));
      }
    };

    checkConnection();
  }, []);

  // 设置钱包事件监听器
  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // 用户断开了连接
        setWalletData({
          address: '',
          signer: null,
          networkId: null,
          isConnected: false,
          isLoading: false,
          error: null
        });
      } else {
        // 账户已更改，更新地址
        setWalletData(prev => ({
          ...prev,
          address: accounts[0],
        }));
      }
    };

    const handleChainChanged = () => {
      // 链已更改，刷新页面以获取新的链ID
      window.location.reload();
    };

    const handleDisconnect = () => {
      setWalletData({
        address: '',
        signer: null,
        networkId: null,
        isConnected: false,
        isLoading: false,
        error: null
      });
    };

    const removeListeners = setupWalletListeners(
      handleAccountsChanged,
      handleChainChanged,
      handleDisconnect
    );

    return () => {
      if (removeListeners) removeListeners();
    };
  }, []);

  // 连接钱包方法
  const connect = async () => {
    try {
      setWalletData(prev => ({ ...prev, isLoading: true, error: null }));
      const connection = await connectWallet();
      setWalletData(prev => ({ 
        ...prev, 
        ...connection, 
        isLoading: false 
      }));
      return connection;
    } catch (error) {
      setWalletData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message 
      }));
      throw error;
    }
  };

  // 断开钱包连接（注意：MetaMask实际上没有提供断开连接的方法）
  const disconnect = () => {
    setWalletData({
      address: '',
      signer: null,
      networkId: null,
      isConnected: false,
      isLoading: false,
      error: null
    });
  };

  const value = {
    ...walletData,
    connect,
    disconnect
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// 使用上下文的自定义Hook
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3必须在Web3Provider内部使用');
  }
  return context;
}; 