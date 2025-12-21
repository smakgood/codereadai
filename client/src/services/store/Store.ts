import { TUser } from "../server/types";

const TOKEN = 'token';
const USER = 'user';
const CURRENT_PAGE = 'currentPage';

// Тип для сохраненной страницы
export type SavedPage = {
    page: number; // PAGES enum value
    params?: {
        taskId?: number;
    };
}

class Store {
    user: TUser | null = null;

    setToken(token: string): void {
        localStorage.setItem(TOKEN, token);
    }

    getToken(): string | null {
        return localStorage.getItem(TOKEN);
    }

    /**
     * Сохранить пользователя в localStorage
     */
    saveUserToStorage(user: TUser): void {
        try {
            localStorage.setItem(USER, JSON.stringify(user));
        } catch (e) {
            console.error('Failed to save user to localStorage:', e);
        }
    }

    /**
     * Загрузить пользователя из localStorage
     */
    loadUserFromStorage(): TUser | null {
        try {
            const userStr = localStorage.getItem(USER);
            if (userStr) {
                return JSON.parse(userStr);
            }
        } catch (e) {
            console.error('Failed to load user from localStorage:', e);
            // Очищаем поврежденные данные
            localStorage.removeItem(USER);
        }
        return null;
    }

    setUser(user: TUser): void {
        const { token } = user;
        this.setToken(token);
        this.user = user;
        this.saveUserToStorage(user);
    }

    getUser(): TUser | null {
        return this.user;
    }

    clearUser(): void {
        this.user = null;
        this.setToken('');
        localStorage.removeItem(USER);
        this.clearCurrentPage();
    }

    /**
     * Сохранить текущую страницу в localStorage
     */
    saveCurrentPage(page: number, params?: { taskId?: number }): void {
        try {
            const savedPage: SavedPage = { page, params };
            localStorage.setItem(CURRENT_PAGE, JSON.stringify(savedPage));
        } catch (e) {
            console.error('Failed to save current page:', e);
        }
    }

    /**
     * Загрузить сохраненную страницу из localStorage
     */
    loadCurrentPage(): SavedPage | null {
        try {
            const pageStr = localStorage.getItem(CURRENT_PAGE);
            if (pageStr) {
                return JSON.parse(pageStr);
            }
        } catch (e) {
            console.error('Failed to load current page:', e);
            localStorage.removeItem(CURRENT_PAGE);
        }
        return null;
    }

    /**
     * Очистить сохраненную страницу
     */
    clearCurrentPage(): void {
        localStorage.removeItem(CURRENT_PAGE);
    }

    setUserName(newName: string): void {
        // Обновляем свойство name в текущем объекте пользователя
        if (this.user) {
            this.user.name = newName;
            this.saveUserToStorage(this.user);
        }
    }
}

export default Store;