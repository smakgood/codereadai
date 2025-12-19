import './Task.scss';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { ServerContext } from '../../App';
import { IBasePage, PAGES } from '../PageManager';
import { TTaskDetail, TAIReview } from '../../services/server/types';
import TaskHeader from './components/TaskHeader';
import TaskInfoSection from './components/TaskInfoSection';
import CodeEditorSection from './components/CodeEditorSection';
import TaskInputSection from './components/TaskInputSection';
import TaskReviewSection from './components/TaskReviewSection';

interface ITaskPage extends IBasePage {
    taskId: number;
}

const Task: React.FC<ITaskPage> = ({ setPage, taskId }) => {
    const server = useContext(ServerContext);
    const [task, setTask] = useState<TTaskDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userDescription, setUserDescription] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [aiParseError, setAiParseError] = useState<boolean>(false);
    const [review, setReview] = useState<TAIReview | null>(null);
    const reviewRef = useRef<HTMLDivElement>(null);
    
    // Editor appearance settings
    const [editorTheme, setEditorTheme] = useState<string>('atom-one-dark');
    const [editorFontSize, setEditorFontSize] = useState<number>(14);

    useEffect(() => {
        const loadTask = async () => {
            setLoading(true);
            setError(null);
            try {
                const loadedTask = await server.getTaskById(taskId);
                if (loadedTask) {
                    setTask(loadedTask);
                } else {
                    setError('Задание не найдено');
                }
            } catch (err) {
                console.error('Ошибка загрузки задания:', err);
                setError('Ошибка загрузки задания');
            } finally {
                setLoading(false);
            }
        };

        loadTask();
    }, [taskId, server]);

    const handleBackClick = () => {
        setPage(PAGES.TASKS);
    };

    const handleSubmit = async () => {
        if (!userDescription.trim()) {
            alert('Пожалуйста, введите описание кода');
            return;
        }
        
        setIsSubmitting(true);
        setReview(null);
        setAiParseError(false);
        
        try {
            const result = await server.submitTask(taskId, userDescription);
            if (result) {
                setReview({
                    id: 0,
                    submission_id: result.submission_id,
                    score: result.score,
                    feedback: result.feedback,
                    strengths: result.strengths,
                    weaknesses: result.weaknesses,
                    suggestions: result.suggestions,
                    created_at: new Date().toISOString()
                });
                
                // Прокрутка к результату после небольшого ожидания рендера
                setTimeout(() => {
                    reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        } catch (err: any) {
            console.error('Ошибка отправки:', err);
            // Проверяем, является ли это ошибкой 9003 (AI не смог распознать ответ)
            if (err instanceof Error && err.message === 'AI_PARSE_ERROR' && 'errorCode' in err && (err as any).errorCode === 9003) {
                setAiParseError(true);
            } else {
                alert('Произошла ошибка при отправке задания на проверку');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="task-page">
                <div className="task-loading">
                    <p>Загрузка задания...</p>
                </div>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="task-page">
                <div className="task-error">
                    <p>{error || 'Задание не найдено'}</p>
                    <button onClick={handleBackClick} className="btn-back">
                        Вернуться к списку
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="task-page">
            <TaskHeader title={task.title} onBackClick={handleBackClick} />
            <main className="task-main">
                <div className="task-container">
                    <TaskInfoSection task={task} />
                    <CodeEditorSection
                        task={task}
                        theme={editorTheme}
                        fontSize={editorFontSize}
                        onThemeChange={setEditorTheme}
                        onFontSizeChange={setEditorFontSize}
                    />
                    <TaskInputSection
                        userDescription={userDescription}
                        onDescriptionChange={setUserDescription}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        aiParseError={aiParseError}
                        onErrorDismiss={() => setAiParseError(false)}
                    />
                    <div ref={reviewRef}>
                        {review && <TaskReviewSection review={review} />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Task;
