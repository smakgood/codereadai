export const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
        case 'easy': return '#10b981';
        case 'medium': return '#3b82f6';
        case 'hard': return '#f59e0b';
        case 'expert': return '#ef4444';
        default: return '#6b7280';
    }
};

export const getDifficultyLabel = (difficulty: string): string => {
    const labels: { [key: string]: string } = {
        'easy': 'Легко',
        'medium': 'Средне',
        'hard': 'Сложно',
        'expert': 'Очень сложно'
    };
    return labels[difficulty] || difficulty;
};

