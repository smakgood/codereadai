import './Login.scss';
import { ServerContext } from '../../App';
import React, { useState, useRef, useContext } from 'react';
import { IBasePage, PAGES } from '../PageManager';


const Login: React.FC<IBasePage> = (props) => {
  const { setPage } = props;
  const [showPwd, setShowPwd] = useState(false);
  const server = useContext(ServerContext);
  const loginRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const loginClickHandler = async () => {
    if (loginRef.current && passwordRef.current) {
      const email = loginRef.current.value;
      const password = passwordRef.current.value;
      if (email && password && await server.login(email, password)) {
        console.log("Успешный вход");
        setPage(PAGES.TASKS);
      } else {
        console.error("Ошибка входа: проверьте email или пароль");
        // Здесь можно показать ошибку пользователю
      }
    }
  };

  const setRegisterPage = () => {
    setPage(PAGES.REGISTER);
  };
 
  return (
    <div className="main-login">
      <main className="sign-wrap">
        {/* ЛОГОТИП */}
        <div className="brand-logo" aria-label="coderead">
          <img src="/images/logo.svg" alt="coderead" className="brand-icon" />
          <span className="brand-text">coderead</span>
        </div>

        <h1 className="sign-title">Вход в аккаунт</h1>

        <section className="sign-card" role="form" aria-label="Форма входа">
          <div className="field">
            <label className="label" htmlFor="email">Почта</label>
            <input
              ref={loginRef}
              className="input"
              id="email"
              type="text"
              placeholder="Введите вашу почту или никнейм"
              autoComplete="username"
            />
          </div>

          <div className="field">
            <div className="password-header">
              <label className="label" htmlFor="password">Пароль</label>
              <button className="forgot-password" type="button">
                Забыли пароль?
              </button>
            </div>
            <div className="password-wrap">
              <input
                ref={passwordRef}
                className="input"
                id="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="Введите ваш пароль"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPwd(v => !v)}
                aria-label={showPwd ? 'Скрыть пароль' : 'Показать пароль'}
                aria-pressed={showPwd}
                title={showPwd ? 'Скрыть пароль' : 'Показать пароль'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                     aria-hidden="true">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>

          <div className="actions">
            <button className="btn-primary" type="button" onClick={loginClickHandler}>
              Войти
            </button>
          </div>
        </section>

        <div className="foot">
          Уже есть аккаунт? <button className="foot-link" onClick={setRegisterPage}>Зарегистрироваться</button>
        </div>
      </main>
    </div>
  );
};

export default Login;
