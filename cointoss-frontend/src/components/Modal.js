import React from 'react';
import useStore from '../store/useStore';

const Modal = ({ type, data, onClose }) => {
  const { updateBalance, addTransaction } = useStore();

  const handleClose = () => {
    onClose();
  };

  const renderModalContent = () => {
    switch (type) {
      case 'BET_CONFIRMATION':
        return (
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold text-white mb-4">Bet Placed!</h2>
            <p className="text-gray-300 mb-6">
              You've placed a bet of ${data.amount} USDT on {data.direction}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Your bet is now locked. Results will be announced when the cycle ends.
            </p>
            <button onClick={handleClose} className="btn btn-primary">
              Got it!
            </button>
          </div>
        );

      case 'RESULT':
        const isWin = data.result === data.userBet;
        return (
          <div className="text-center">
            <div className={`text-6xl mb-4 ${isWin ? 'text-green' : 'text-red'}`}>
              {isWin ? '🎉' : '😔'}
            </div>
            <h2 className={`text-3xl font-bold mb-4 ${isWin ? 'text-green' : 'text-red'}`}>
              {isWin ? 'You Won!' : 'You Lost'}
            </h2>
            {isWin && (
              <p className="text-2xl font-bold text-green mb-4">
                +${data.winnings.toFixed(2)} added to your wallet
              </p>
            )}
            <p className="text-gray-300 mb-6">
              The price went {data.result}
            </p>
            <button onClick={handleClose} className="btn btn-primary">
              Continue Playing
            </button>
          </div>
        );

      case 'INSUFFICIENT_FUNDS':
        return (
          <div className="text-center">
            <div className="text-6xl mb-4">💰</div>
            <h2 className="text-3xl font-bold text-red mb-4">Insufficient Funds</h2>
            <p className="text-gray-300 mb-6">
              You don't have enough USDT to place this bet.
            </p>
            <button onClick={handleClose} className="btn btn-primary">
              OK
            </button>
          </div>
        );

      case 'WALLET_INFO':
        return (
          <div className="text-center">
            <div className="text-6xl mb-4">💳</div>
            <h2 className="text-3xl font-bold text-white mb-4">Wallet Info</h2>
            <p className="text-gray-300 mb-6">
              You received $100 USDT as a welcome bonus!
            </p>
            <button onClick={handleClose} className="btn btn-primary">
              Start Playing!
            </button>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Modal</h2>
            <button onClick={handleClose} className="btn btn-primary">
              Close
            </button>
          </div>
        );
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {renderModalContent()}
      </div>
    </div>
  );
};

export default Modal;