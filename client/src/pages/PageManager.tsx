import React, { useState, useEffect, useContext } from 'react';
import Preloader from './Preloader/Preloader';
import Login from './Login/Login';
import NotFound from './NotFound/NotFound';
import Register from './Register/Register';
import Tasks from './Tasks/Tasks';
import Task from './Task/Task';
import { ServerContext, StoreContext } from '../App';
import { SavedPage } from '../services/store/Store';

export enum PAGES {
    PRELOADER,
    LOGIN,
    NOT_FOUND,
    REGISTER,
    TASKS,
    TASK,
}

export interface IBasePage {
    setPage: (name: PAGES, taskId?: number) => void
}

const PageManager: React.FC = () => {
    const [page, setPage] = useState<PAGES>(PAGES.PRELOADER);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const store = useContext(StoreContext);
    const server = useContext(ServerContext);

    const handleSetPage = (newPage: PAGES, taskId?: number) => {
        // Не сохраняем служебные страницы
        if (newPage !== PAGES.PRELOADER && newPage !== PAGES.NOT_FOUND) {
            store.saveCurrentPage(newPage, taskId ? { taskId } : undefined);
        }
        
        if (newPage === PAGES.TASK && taskId) {
            setSelectedTaskId(taskId);
        }
        setPage(newPage);
    };

    // Проверка доступности страницы
    const isPageAccessible = (page: PAGES, isAuthenticated: boolean): boolean => {
        const requiresAuth = [PAGES.TASKS, PAGES.TASK];
        if (requiresAuth.includes(page)) {
            return isAuthenticated;
        }
        // Публичные страницы доступны всегда
        return true;
    };

    // Восстановление страницы с параметрами
    const restorePage = (savedPage: SavedPage) => {
        if (savedPage.page === PAGES.TASK && savedPage.params?.taskId) {
            setSelectedTaskId(savedPage.params.taskId);
            setPage(PAGES.TASK);
        } else {
            setPage(savedPage.page as PAGES);
        }
    };

    // Восстановление сессии при загрузке приложения
    useEffect(() => {
        const restoreSession = async () => {
            const token = store.getToken();
            const savedPage = store.loadCurrentPage();
            
            if (token) {
                // Пытаемся восстановить из localStorage (быстро)
                const savedUser = store.loadUserFromStorage();
                if (savedUser) {
                    store.setUser(savedUser); // Восстанавливаем в память
                    
                    // Восстанавливаем страницу, если она валидна
                    if (savedPage && isPageAccessible(savedPage.page as PAGES, true)) {
                        restorePage(savedPage);
                    } else {
                        setPage(PAGES.TASKS); // Дефолтная страница для авторизованных
                    }
                }
                
                // Проверяем токен на сервере (валидация)
                const sessionCheck = await server.checkSession();
                if (sessionCheck.user) {
                    // Токен валиден - обновляем данные
                    store.setUser(sessionCheck.user);
                    
                    // Восстанавливаем страницу после валидации
                    if (savedPage && isPageAccessible(savedPage.page as PAGES, true)) {
                        restorePage(savedPage);
                    } else {
                        setPage(PAGES.TASKS);
                    }
                } else if (sessionCheck.isAuthError) {
                    // Токен невалиден (ошибка авторизации) - очищаем
                    store.clearUser();
                    store.clearCurrentPage(); // Очищаем сохраненную страницу
                    setPage(PAGES.LOGIN);
                } else {
                    // Временная ошибка (сеть, сервер) - оставляем пользователя залогиненным
                    // Используем сохраненные данные из localStorage
                    if (!savedUser) {
                        // Если не было сохраненных данных, переходим на LOGIN
                        store.clearUser();
                        setPage(PAGES.LOGIN);
                    }
                    // Иначе остаемся на текущей странице с сохраненными данными
                }
            } else {
                // Пользователь не авторизован
                if (savedPage && isPageAccessible(savedPage.page as PAGES, false)) {
                    // Восстанавливаем только публичные страницы
                    restorePage(savedPage);
                } else {
                    setPage(PAGES.LOGIN);
                }
            }
        };
        
        restoreSession();
    }, [store, server]);

    return (
        <>
            {page === PAGES.PRELOADER && <Preloader setPage={handleSetPage} />}
            {page === PAGES.LOGIN && <Login setPage={handleSetPage} />}
            {page === PAGES.REGISTER && <Register setPage={handleSetPage} />}
            {page === PAGES.TASKS && <Tasks setPage={handleSetPage} />}
            {page === PAGES.TASK && selectedTaskId && <Task setPage={handleSetPage} taskId={selectedTaskId} />}
            {page === PAGES.NOT_FOUND && <NotFound setPage={handleSetPage} />}
        </>
    );
}

export default PageManager;