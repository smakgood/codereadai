import React, { useContext } from 'react';
import { ServerContext } from '../../../App';
import { PAGES } from '../../PageManager';

interface TaskHeaderProps {
    title: string;
    onBackClick: () => void;
    setPage?: (page: PAGES) => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ title, onBackClick, setPage }) => {
    const server = useContext(ServerContext);

    const handleLogout = async () => {
        await server.logout();
        if (setPage) {
            setPage(PAGES.LOGIN);
        }
    };

    return (
        <header className="task-header">
            <button onClick={onBackClick} className="btn-back-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Назад
            </button>
            <h1 className="task-title-header">{title}</h1>
            <div className="task-header-spacer"></div>
            {setPage && (
                <button 
                    className="logout-button-header" 
                    aria-label="Выход"
                    onClick={handleLogout}
                    title="Выйти из аккаунта"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            )}
        </header>
    );
};

export default TaskHeader;

