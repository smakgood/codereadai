import React, { useContext, useState, useEffect } from 'react';
import { ServerContext } from '../../App';
import Button from '../Button/Button';

import './Popup.scss';
import { TError } from '../../services/server/types';

type TInnerButton = {
    isHover?: boolean;
    text: string;
    onClick: () => void;
}

export type TPopupData = {
    className?: string;
    title?: string;
    text?: string;
    closeHovered?: boolean;
    buttons?: TInnerButton[];
};

const Popup: React.FC = () => {
    const server = useContext(ServerContext);
    const [data, setData] = useState<TPopupData | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const showErrorHandler = (error: TError) => {
            const { code, text } = error;
            setData({
                title: `#${code}`,
                text,
            });
            setIsVisible(true);
            
            setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => setData(null), 300);
            }, 3000);
        }
    
        server.showError(showErrorHandler);
    });

    if (!data) return (<></>);

    const { title, text, buttons = [] } = data;

    return (<div className={`popup ${isVisible ? 'popup--visible' : 'popup--hidden'}`}>
        <div className={'popup-wrapper'}>
            <div className='popup-text-block'>
                <div className="popup-title">{title}</div>
                <div className="popup--info-text">{text}</div>
            </div>
            <div className='buttons-block'>
                {buttons.map((data, index) => {
                    const { text, onClick, isHover } = data;
                    return <Button
                        variant='main'
                        key={index}
                        text={text}
                        onClick={onClick}
                        isHover={isHover}
                    />
                })}
            </div>
        </div>
    </div>);
}

export default Popup;