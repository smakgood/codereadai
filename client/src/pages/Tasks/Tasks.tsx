import './Tasks.scss';
import React, { useContext, useState, useEffect } from 'react';
import { ServerContext, StoreContext } from '../../App';
import { IBasePage, PAGES } from '../PageManager';
import { TTask } from '../../services/server/types';
import ProfileIcon from '../../assets/img/icons/Profile.png';
import SettingsIcon from '../../assets/img/icons/Settings.png';

const Tasks: React.FC<IBasePage> = ({ setPage }) => {
    const store = useContext(StoreContext);
    const server = useContext(ServerContext);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [tasks, setTasks] = useState<TTask[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Загрузка задач с сервера
    useEffect(() => {
        // Проверка контекста внутри useEffect
        if (!store || !server) {
            console.error('Store or Server context is missing');
            setError('Ошибка загрузки страницы');
            setLoading(false);
            return;
        }

        const loadTasks = async () => {
            setLoading(true);
            setError(null);
            try {
                const difficulty = selectedDifficulty === 'all' ? undefined : selectedDifficulty;
                const loadedTasks = await server.getTasks(difficulty);
                if (loadedTasks) {
                    setTasks(loadedTasks);
                } else {
                    setError('Не удалось загрузить задачи');
                }
            } catch (err) {
                console.error('Ошибка загрузки задач:', err);
                setError('Ошибка загрузки задач');
            } finally {
                setLoading(false);
            }
        };

        loadTasks();
    }, [selectedDifficulty, server, store]);

    const difficulties = [
        { value: 'all', label: 'Все' },
        { value: 'easy', label: 'Легко' },
        { value: 'medium', label: 'Средне' },
        { value: 'hard', label: 'Сложно' },
        { value: 'expert', label: 'Очень сложно' }
    ];

    const getDifficultyLabel = (difficulty: string) => {
        const diff = difficulties.find(d => d.value === difficulty);
        return diff ? diff.label : difficulty;
    };

    // Фильтрация задач по поисковому запросу (фильтр по сложности уже применен на сервере)
    const filteredTasks = tasks.filter((task: TTask) => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             task.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="tasks-page">
            {/* Header */}
            <header className="tasks-header">
                <div className="header-left">
                    <div className="brand-logo" aria-label="coderead">
                        <img src="/images/logo.svg" alt="coderead" className="brand-icon" />
                        <span className="brand-text">coderead</span>
                    </div>
                </div>
                <div className="header-right">
                    <button className="icon-button" aria-label="Профиль">
                        <img src={ProfileIcon} alt="Профиль" />
                    </button>
                    <button className="icon-button" aria-label="Настройки">
                        <img src={SettingsIcon} alt="Настройки" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="tasks-main">
                <div className="tasks-container">
                    {/* Title Section */}
                    <div className="tasks-title-section">
                        <h1 className="tasks-title">
                            Прочитайте код и опишите, что он делает. AI оценит вашу точность.
                        </h1>
                    </div>

                    {/* Search Bar */}
                    <div className="tasks-search">
                        <div className="search-input-wrapper">
                            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Поиск задач..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Difficulty Filters */}
                    <div className="tasks-filters">
                        <div className="filter-group">
                            {difficulties.map(diff => (
                                <button
                                    key={diff.value}
                                    className={`filter-button ${selectedDifficulty === diff.value ? 'active' : ''}`}
                                    onClick={() => setSelectedDifficulty(diff.value)}
                                >
                                    {diff.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* User Stats */}
                    <div className="tasks-stats">
                        <div className="stat-card">
                            <div className="stat-value">{tasks.length}</div>
                            <div className="stat-label">Задач</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">0</div>
                            <div className="stat-label">Решено</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">0%</div>
                            <div className="stat-label">Точность</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">-</div>
                            <div className="stat-label">Рейтинг</div>
                        </div>
                    </div>

                    {/* Tasks Grid */}
                    <div className="tasks-grid">
                        {loading ? (
                            <div className="no-tasks">
                                <p>Загрузка задач...</p>
                            </div>
                        ) : error ? (
                            <div className="no-tasks">
                                <p>{error}</p>
                            </div>
                        ) : filteredTasks.length > 0 ? (
                            filteredTasks.map((task: TTask) => (
                                <div 
                                    key={task.id} 
                                    className="task-card"
                                    onClick={() => setPage(PAGES.TASK, task.id)}
                                >
                                    <div className="task-card-header">
                                        <h3 className="task-title">{task.title}</h3>
                                        <span className="task-id">#{task.id}</span>
                                    </div>
                                    <div className="task-card-body">
                                        {task.description && (
                                            <p className="task-description">{task.description}</p>
                                        )}
                                    </div>
                                    <div className="task-card-footer">
                                        <span className={`task-difficulty ${task.difficulty}`}>
                                            {getDifficultyLabel(task.difficulty)}
                                        </span>
                                        <span className="task-language">{task.language_name.toUpperCase()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-tasks">
                                <p>
                                    {selectedDifficulty === 'all' 
                                        ? 'Задач пока нет' 
                                        : `Задач уровня "${getDifficultyLabel(selectedDifficulty)}" пока нет`}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Tasks;

