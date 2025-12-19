import React from 'react';
import AIErrorOverlay from './AIErrorOverlay';

interface TaskInputSectionProps {
    userDescription: string;
    onDescriptionChange: (value: string) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    aiParseError?: boolean;
    onErrorDismiss?: () => void;
}

const TaskInputSection: React.FC<TaskInputSectionProps> = ({
    userDescription,
    onDescriptionChange,
    onSubmit,
    isSubmitting,
    aiParseError = false,
    onErrorDismiss
}) => {
    return (
        <div className="task-input-section">
            <h2 className="section-title">Ваше описание</h2>
            <p className="section-description">
                Опишите, что делает этот код. Искусственный интеллект оценит точность вашего описания.
            </p>
            <div className="input-wrapper">
                {isSubmitting && !aiParseError && (
                    <div className="loading-overlay">
                        <div className="loader-spinner"></div>
                        <span className="loader-text">Нейросеть проверяет ваш ответ</span>
                    </div>
                )}
                {aiParseError && (
                    <AIErrorOverlay onDismiss={onErrorDismiss} />
                )}
            <textarea
                className="user-input-textarea"
                placeholder="Введите описание кода..."
                value={userDescription}
                onChange={(e) => onDescriptionChange(e.target.value)}
                rows={4} // Уменьшено с 6 до 4
                disabled={isSubmitting}
            />
            </div>
            <div className="task-buttons-wrapper">
                <button 
                    onClick={onSubmit} 
                    className="btn-submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Проверка...' : 'Отправить на проверку'}
                </button>
                <button 
                    className="btn-draft"
                    disabled={isSubmitting}
                >
                    Сохранить черновик
                </button>
            </div>
        </div>
    );
};

export default TaskInputSection;

