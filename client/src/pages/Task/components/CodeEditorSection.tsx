import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import { TTaskDetail } from '../../../services/server/types';

interface CodeEditorSectionProps {
    task: TTaskDetail;
    theme: string;
    fontSize: number;
    onThemeChange: (theme: string) => void;
    onFontSizeChange: (size: number) => void;
}

const THEMES: { [key: string]: { name: string, url: string } } = {
    'atom-one-dark': { name: 'Atom One Dark (Тёмная)', url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css' },
    'github': { name: 'GitHub (Светлая)', url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css' },
    'monokai-sublime': { name: 'Monokai Sublime (Тёмная)', url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/monokai-sublime.min.css' },
    'vs2015': { name: 'VS 2015 (Тёмная)', url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css' },
    'solarized-light': { name: 'Solarized Light (Светлая)', url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/solarized-light.min.css' },
};

const CodeEditorSection: React.FC<CodeEditorSectionProps> = ({
    task,
    fontSize,
    onThemeChange,
    onFontSizeChange,
    theme
}) => {
    const codeRef = useRef<HTMLElement>(null);

    // Динамическая смена темы
    useEffect(() => {
        const themeId = 'hljs-theme-link';
        let link = document.getElementById(themeId) as HTMLLinkElement;
        
        if (!link) {
            link = document.createElement('link');
            link.id = themeId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        
        const themeConfig = THEMES[theme] || THEMES['atom-one-dark'];
        link.href = themeConfig.url;
    }, [theme]);

    // Подсветка кода
    useEffect(() => {
        if (codeRef.current) {
            // Сбрасываем атрибут от hljs для переподсветки
            codeRef.current.removeAttribute('data-highlighted');
            codeRef.current.textContent = task.code;
            hljs.highlightElement(codeRef.current);
        }
    }, [task.code, task.language_slug, theme]);

    // Маппинг языков для Highlight.js
    const getHljsLanguage = (slug: string | undefined) => {
        if (!slug) return 'python';
        const languageMap: { [key: string]: string } = {
            'c-plus-plus': 'cpp',
            'c-sharp': 'csharp',
            'javascript': 'javascript',
            'typescript': 'typescript',
            'python': 'python',
            'java': 'java',
            'php': 'php',
            'go': 'go',
            'rust': 'rust'
        };
        return languageMap[slug] || slug;
    };

    const hljsLang = getHljsLanguage(task.language_slug);

    return (
        <div className="task-code-section">
            <div className="code-section-header">
                <h2 className="section-title">Код задания</h2>
                <div className="editor-settings">
                    <select
                        id="editor-theme"
                        value={theme}
                        onChange={(e) => onThemeChange(e.target.value)}
                        className="setting-select"
                    >
                        {Object.entries(THEMES).map(([id, config]) => (
                            <option key={id} value={id}>{config.name}</option>
                        ))}
                    </select>
                    <select
                        id="editor-font-size"
                        value={fontSize}
                        onChange={(e) => onFontSizeChange(Number(e.target.value))}
                        className="setting-select"
                    >             
                        <option value="8">8</option>              
                        <option value="10">10</option>
                        <option value="12">12</option>
                        <option value="14">14</option>
                        <option value="16">16</option>
                        <option value="18">18</option>
                        <option value="20">20</option>
                        <option value="22">22</option>
                        <option value="24">24</option>
                    </select>
                </div>
            </div>
            <div className="code-editor-wrapper">
                <pre style={{ fontSize: `${fontSize}px`, margin: 0 }}>
                    <code 
                        ref={codeRef}
                        className={`language-${hljsLang}`}
                    >
                        {task.code}
                    </code>
                </pre>
            </div>
        </div>
    );
};

export default CodeEditorSection;
