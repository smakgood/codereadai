import React, { useState } from 'react';
import Preloader from './Preloader/Preloader';
import Login from './Login/Login';
import NotFound from './NotFound/NotFound';
import Register from './Register/Register';
import Tasks from './Tasks/Tasks';
import Task from './Task/Task';

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
    const [page, setPage] = useState<PAGES>(PAGES.LOGIN);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

    const handleSetPage = (newPage: PAGES, taskId?: number) => {
        if (newPage === PAGES.TASK && taskId) {
            setSelectedTaskId(taskId);
        }
        setPage(newPage);
    };

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