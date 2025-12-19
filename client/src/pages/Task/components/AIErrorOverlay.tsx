import React from 'react';
import errorIcon from '../../../assets/img/icons/error.png';

interface AIErrorOverlayProps {
    onDismiss?: () => void;
}

const AIErrorOverlay: React.FC<AIErrorOverlayProps> = ({ onDismiss }) => {
    return (
        <div className="error-overlay">
            <img src={errorIcon} alt="Ошибка" className="error-icon" />
            <span className="error-text">Нейросеть не смогла распознать ваше описание, попробуйте ещё раз</span>
            {onDismiss && (
                <button className="error-dismiss-btn" onClick={onDismiss}>
                    ✕
                </button>
            )}
        </div>
    );
};

export default AIErrorOverlay;

