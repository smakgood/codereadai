import md5 from 'md5';
import CONFIG from "../../config";
import Store from "../store/Store";
import { TAnswer, TError, TUser, TTask, TTaskDetail, TSubmissionResponse, TAIReview } from "./types";

const { HOST } = CONFIG;

class Server {
    HOST = HOST;
    store: Store;
    showErrorCb: (error: TError) => void = () => {};

    constructor(store: Store) {
        this.store = store;
    }

    // посылает запрос и обрабатывает ответ
    private async request<T>(method: string, params: { [key: string]: string } = {}): Promise<T | null> {
        try {
            params.method = method;
            const token = this.store.getToken();
            if (token) {
                params.token = token;
            }
            const response = await fetch(`${this.HOST}/?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}`);
            const answer: TAnswer<T> = await response.json();
            if (answer.result === 'ok' && answer.data) {
                return answer.data;
            }
            answer.error && this.setError(answer.error);
            return null;
        } catch (e) {
            console.log(e);
            this.setError({
                code: 9000,
                text: 'Unknown error',
            });
            return null;
        }
    }

    private setError(error: TError): void {
        this.showErrorCb(error);
    }

    showError(cb: (error: TError) => void) {
        this.showErrorCb = cb;
    }

    async login(email: string, password: string): Promise<boolean> {
        const rnd = Math.round(Math.random() * 100000);
        const passHash = md5(password);
        const hash = md5(`${passHash}${rnd}`);  
        const user = await this.request<TUser>('login', { email, hash, rnd: `${rnd}` });
        if (user) {
            this.store.setUser(user);
            return true;
        }
        return false;
    }

    async logout() {
        const result = await this.request<boolean>('logout');
        if (result) {
            this.store.clearUser();
        }
    }

    /**
     * Проверить валидность текущей сессии
     * Возвращает данные пользователя если токен валиден, иначе null
     * Также возвращает null при ошибке авторизации (705), но не при других ошибках
     */
    async checkSession(): Promise<{ user: TUser | null; isAuthError: boolean }> {
        const token = this.store.getToken();
        if (!token) {
            return { user: null, isAuthError: true };
        }
        try {
            const params: { [key: string]: string } = {};
            params.method = 'getCurrentUser';
            params.token = token;
            const response = await fetch(`${this.HOST}/?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}`);
            const answer: TAnswer<TUser> = await response.json();
            if (answer.result === 'ok' && answer.data) {
                return { user: answer.data, isAuthError: false };
            }
            // Если ошибка авторизации (705), это реальная проблема с токеном
            if (answer.error && answer.error.code === 705) {
                return { user: null, isAuthError: true };
            }
            // При других ошибках не считаем это проблемой авторизации
            // (это может быть временная ошибка сети или сервера)
            return { user: null, isAuthError: false };
        } catch (e) {
            console.log('checkSession error:', e);
            // При ошибке сети не считаем это проблемой авторизации
            return { user: null, isAuthError: false };
        }
    }
    // async logout(): Promise<void> {
    //     const result = await this.request<boolean>('logout');
    //     if (result) {
    //         this.store.clearUser();
    //     }
    // }
    async updateUserName(newName: string): Promise<boolean> {
        // Вызываем серверный метод updateUserName, передавая новое имя
        const result = await this.request<boolean>('updateUserName', { newName });
        
        if (result) {
            // Если сервер вернул 'ok', обновляем имя локально в Store
            this.store.setUserName(newName); 
            return true;
        }
        return false;
    }


    async registration(email: string, password: string, name: string): Promise<boolean> {
        const passHash = md5(password);
        // 1. Ожидаем от сервера полный объект пользователя (TUser)
        const user = await this.request<TUser>('registration', { email, password: passHash, name });

        // 2. Если пользователь успешно создан и получен...
        if (user) {
            // 3. ...сохраняем его данные в store, чтобы он сразу вошел в систему
            this.store.setUser(user);
            return true;
        }
        // 4. Если что-то пошло не так, возвращаем false
        return false;
    }

    async getTasks(difficulty?: string): Promise<TTask[] | null> {
        const params: { [key: string]: string } = {};
        if (difficulty && difficulty !== 'all') {
            params.difficulty = difficulty;
        }
        return await this.request<TTask[]>('getTasks', params);
    }

    async getTaskById(taskId: number): Promise<TTaskDetail | null> {
        return await this.request<TTaskDetail>('getTaskById', { task_id: taskId.toString() });
    }

    async submitTask(taskId: number, userDescription: string): Promise<TSubmissionResponse | null> {
        try {
            const params: { [key: string]: string } = {
                method: 'submitTask',
                task_id: taskId.toString(),
                user_description: userDescription
            };
            const token = this.store.getToken();
            if (token) {
                params.token = token;
            }
            const response = await fetch(`${this.HOST}/?${Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')}`);
            const answer: TAnswer<TSubmissionResponse> = await response.json();
            if (answer.result === 'ok' && answer.data) {
                return answer.data;
            }
            if (answer.error) {
                // Если ошибка 9003, выбрасываем специальное исключение
                if (answer.error.code === 9003) {
                    const error = new Error('AI_PARSE_ERROR') as Error & { errorCode: number };
                    error.errorCode = 9003;
                    throw error;
                }
                this.setError(answer.error);
            }
            return null;
        } catch (e) {
            // Если это наше специальное исключение, пробрасываем дальше
            if (e instanceof Error && 'errorCode' in e && (e as any).errorCode === 9003) {
                throw e;
            }
            console.log(e);
            this.setError({
                code: 9000,
                text: 'Unknown error',
            });
            return null;
        }
    }

    async getSubmissionReview(submissionId: number): Promise<TAIReview | null> {
        return await this.request<TAIReview>('getSubmissionReview', { 
            submission_id: submissionId.toString() 
        });
    }
} 

export default Server;