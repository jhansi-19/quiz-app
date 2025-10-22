import React, { useEffect, useState } from 'react';
import { apiGet } from '../aws-config'; // Adjust path as needed
import { Link } from 'react-router-dom';

function QuizList({ user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await apiGet('quizApi', '/quizzes');
        console.log('API Response:', response);
        const data = await response.body.json();
        console.log('Parsed Data:', data);
        setQuizzes(data);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  if (loading) return <div className="loading">Loading quizzes...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="quiz-list">
      <h2>Choose a Quiz</h2>
      <div className="quiz-cards">
        {quizzes.length === 0 ? (
          <p>No quizzes available</p>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz.quizId} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <Link to={`/quizzes/${quiz.quizId}`} className="start-btn">Start Quiz</Link>
            </div>
          ))
        )}
      </div>
      <Link to="/scores" className="view-scores-link">View Your Scores</Link>
    </div>
  );
}

export default QuizList;
