import React from 'react';
import { TTaskDetail } from '../../../services/server/types';
import { getDifficultyColor, getDifficultyLabel } from '../utils';

interface TaskInfoSectionProps {
    task: TTaskDetail;
}

const TaskInfoSection: React.FC<TaskInfoSectionProps> = ({ task }) => {
    return (
        <div className="task-info-section">
            <h2 className="task-title-section">{task.title}</h2>
            <div className="task-meta">
                <span className="task-id">#{task.id}</span>
                <span
                    className="task-difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(task.difficulty) }}
                >
                    {getDifficultyLabel(task.difficulty)}
                </span>
                <span className="task-language-badge">
                    {task.language_name.toUpperCase()}
                </span>
            </div>
            {task.description && (
                <p className="task-description">{task.description}</p>
            )}
        </div>
    );
};

export default TaskInfoSection;

