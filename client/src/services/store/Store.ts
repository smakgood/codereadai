import { TUser } from "../server/types";

const TOKEN = 'token';

class Store {
    user: TUser | null = null;

    setToken(token: string): void {
        localStorage.setItem(TOKEN, token);
    }

    getToken(): string | null {
        return localStorage.getItem(TOKEN);
    }

    setUser(user: TUser): void {
        const { token } = user;
        this.setToken(token);
        this.user = user;
    }

    getUser(): TUser | null {
        return this.user;
    }

    clearUser(): void {
        this.user = null;
        this.setToken('');
    }

    setUserName(newName: string): void {
        // Обновляем свойство name в текущем объекте пользователя
        if (this.user) {
            this.user.name = newName;
        }
    }
}

export default Store;