import React, { useEffect, useState } from 'react';
import { get } from '@aws-amplify/api';
import { Link } from 'react-router-dom';

function QuizList({ user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added for debugging

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await get({
          apiName: 'quizApi',
          path: '/quizzes'
        }).response;
        console.log('API Response:', response); // Debug raw response
        const data = await response.body.json();
        console.log('Parsed Data:', data); // Debug parsed data
        setQuizzes(data);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError(err.message); // Capture error
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