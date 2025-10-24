import React, { useEffect, useState } from 'react';
import { apiGet } from '../aws-config';
import { Link } from 'react-router-dom';

function Scores({ user }) {
  const [scores, setScores] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        if (!user || (!user.username && !user.attributes?.sub)) {
          setError('Please log in to view your scores');
          setLoading(false);
          return;
        }

        const userId = user.username || user.attributes.sub;
        const [scoresResponse, leaderboardResponse] = await Promise.all([
          apiGet('quizApi', `/scores?userId=${userId}`),
          apiGet('quizApi', '/leaderboard')
        ]);
        const scoresData = await scoresResponse.body.json();
        const leaderboardData = await leaderboardResponse.body.json();

        if (scoresData.error) throw new Error(scoresData.error);
        if (leaderboardData.error) throw new Error(leaderboardData.error);
        setScores(scoresData || []);
        setLeaderboard(leaderboardData || []);
      } catch (err) {
        setError(err.message || 'Failed to load scores');
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, [user]);

  if (loading) return <div className="loading">Loading scores...</div>;

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <Link to="/" className="back-btn">Back to Quizzes</Link>
      </div>
    );
  }

  return (
    <div className="scores-container">
      <h2>Your Quiz Scores</h2>
      {scores.length === 0 ? (
        <div className="no-scores-container">
          <p className="no-scores">No scores yet. Take a quiz!</p>
          <Link to="/" className="take-quiz-btn">Browse Quizzes</Link>
        </div>
      ) : (
        <>
          <div className="scores-summary">
            <div className="stat">
              <span className="stat-number">{scores.length}</span>
              <span className="stat-label">Quizzes Taken</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) : 0}%
              </span>
              <span className="stat-label">Average Score</span>
            </div>
            <div className="stat">
              <span className="stat-number">{scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0}%</span>
              <span className="stat-label">Best Score</span>
            </div>
          </div>

          <div className="scores-list">
            {scores.map((score, index) => {
              const totalQuestions = score.answers ? Object.keys(score.answers).length : 0;
              const correctAnswers = Math.round((score.score / 100) * totalQuestions);
              return (
                <div key={`${score.userId}-${score.quizId}-${index}`} className="score-card">
                  <div className="score-header">
                    <h3>Quiz: {score.quizId}</h3>
                    <span className={`score-badge ${score.score >= 70 ? 'pass' : 'fail'}`}>
                      {score.score}%
                    </span>
                  </div>
                  <div className="score-details">
                    {totalQuestions > 0 && (
                      <p><strong>Correct Answers:</strong> {correctAnswers} / {totalQuestions}</p>
                    )}
                    <p><strong>Completed:</strong> {new Date(score.completedAt).toLocaleString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}</p>
                  </div>
                  <Link to={`/quizzes/${score.quizId}`} className="retake-btn">
                    Retake Quiz
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}

      <h2>Leaderboard (Top 10)</h2>
      {leaderboard.length === 0 ? (
        <p>No leaderboard data available yet.</p>
      ) : (
        <div className="leaderboard-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User ID</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{entry.userId}</td>
                  <td>{entry.score}%</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Link to="/" className="back-btn">Back to Quizzes</Link>
    </div>
  );
}

export default Scores;
