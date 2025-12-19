import React from 'react';
import { TAIReview } from '../../../services/server/types';

interface TaskReviewSectionProps {
    review: TAIReview;
}

const TaskReviewSection: React.FC<TaskReviewSectionProps> = ({ review }) => {
    // Determine color based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return '#4caf50'; // Green
        if (score >= 50) return '#ff9800'; // Orange
        return '#f44336'; // Red
    };

    return (
        <div className="task-review-section">
            <div className="review-header">
                <h2 className="section-title">Результат проверки AI</h2>
                <div 
                    className="review-score-badge"
                    style={{ backgroundColor: getScoreColor(review.score) }}
                >
                    Оценка: {review.score}/100
                </div>
            </div>
            
            <div className="review-content">
                {(review.feedback || '').trim() && (
                    <div className="feedback-group">
                        <div className="feedback-label">Комментарий AI:</div>
                        <div className="feedback-text">
                            {review.feedback.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    </div>
                )}

                {review.strengths && review.strengths.length > 0 && review.strengths[0] !== "" && (
                    <div className="feedback-group">
                        <div className="feedback-label strengths">Сильные стороны:</div>
                        <ul className="feedback-list">
                            {review.strengths.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {review.weaknesses && review.weaknesses.length > 0 && (
                    <div className="feedback-group">
                        <div className="feedback-label weaknesses">Что можно улучшить:</div>
                        <ul className="feedback-list">
                            {review.weaknesses.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {review.suggestions && review.suggestions.length > 0 && (
                    <div className="feedback-group">
                        <div className="feedback-label suggestions">Рекомендации:</div>
                        <ul className="feedback-list">
                            {review.suggestions.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskReviewSection;
