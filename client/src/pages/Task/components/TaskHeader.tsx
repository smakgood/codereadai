import React from 'react';

interface TaskHeaderProps {
    title: string;
    onBackClick: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ title, onBackClick }) => {
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
        </header>
    );
};

export default TaskHeader;

