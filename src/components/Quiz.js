import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../aws-config';
import { useParams, useNavigate } from 'react-router-dom';

function Quiz({ user }) {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await apiGet('quizApi', `/new-quizzes/${quizId}`);
        if (!response.body) throw new Error('No response body received');
        const data = await response.body.json();
        if (data.error) throw new Error(data.error);
        setQuiz({ ...data, questions: Array.isArray(data.questions) ? data.questions : [] });
      } catch (err) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!submitted && quiz && quiz.questions.length > 0 && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
        if (timeLeft === 1) {
          handleTimeUp();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, submitted, quiz]);

  const handleOptionChange = (questionId, selectedOption) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
  };

  const calculateScore = () => {
    if (!quiz || !quiz.questions) return { correctCount: 0, totalQuestions: 0, percentage: 0 };
    let correctCount = 0;
    quiz.questions.forEach(question => {
      if (answers[question.questionId] === question.answer) correctCount++;
    });
    return {
      correctCount,
      totalQuestions: quiz.questions.length,
      percentage: Math.round((correctCount / quiz.questions.length) * 100)
    };
  };

  const handleTimeUp = () => {
    const unanswered = quiz.questions.filter(q => !answers[q.questionId]);
    if (unanswered.length > 0) {
      alert(`Time's up! ${unanswered.length} question(s) unanswered. Submitting with current answers.`);
    }
    handleSubmit();
  };

  const handleSubmit = async () => {
    const unansweredQuestions = quiz.questions.filter(q => !answers[q.questionId]);
    if (unansweredQuestions.length > 0 && timeLeft > 0) {
      alert(`Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`);
      return;
    }

    setSubmitting(true);
    const scoreData = calculateScore();

    try {
      const response = await apiPost('quizApi', '/scores', {
        body: {
          userId: user?.username || user?.attributes?.sub || 'guest',
          quizId: quizId,
          score: scoreData.percentage,
          answers: answers,
          completedAt: new Date().toISOString()
        }
      });
      setResult(scoreData);
      setSubmitted(true);
    } catch (err) {
      setResult(scoreData);
      setSubmitted(true);
      alert(`Quiz completed but score submission failed.\nError: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const isQuestionCorrect = (question) => answers[question.questionId] === question.answer;

  if (loading) return <div className="loading">Loading quiz...</div>;
  if (error) return (
    <div className="error">
      <p>Error: {error}</p>
      <button onClick={() => navigate('/')} className="back-btn">
        Back to Quizzes
      </button>
    </div>
  );
  if (!quiz) return <div className="error">Quiz not found</div>;

  if (submitted && result) return (
    <div className="quiz-container">
      <div className="results-container">
        <h2>Quiz Results</h2>
        <div className="score-summary">
          <h3>{quiz.title || 'Quiz'}</h3>
          <p className="score-percentage">Your Score: {result.percentage}%</p>
          <p className="score-detail">{result.correctCount} out of {result.totalQuestions} correct</p>
        </div>
        <div className="answers-review">
          <h3>Review Your Answers</h3>
          {quiz.questions.map((question, index) => {
            const correct = isQuestionCorrect(question);
            const userAnswer = answers[question.questionId];
            return (
              <div key={question.questionId} className={`question-review ${correct ? 'correct' : 'incorrect'}`}>
                <h4>
                  Question {index + 1}: {question.question}
                  <span className="badge">{correct ? '✓ Correct' : '✗ Incorrect'}</span>
                </h4>
                <div>
                  {question.options.map((option, optIndex) => {
                    const isUserAnswer = option === userAnswer;
                    const isCorrectAnswer = option === question.answer;
                    return (
                      <div key={optIndex} className="option-review" data-correct={isCorrectAnswer} data-user={isUserAnswer && !correct}>
                        <span>{option}</span>
                        {isCorrectAnswer && <span className="badge">Correct Answer</span>}
                        {isUserAnswer && !isCorrectAnswer && <span className="badge">Your Answer</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="action-buttons">
          <button onClick={() => navigate('/scores')}>View All Scores</button>
          <button onClick={() => navigate('/')}>Back to Quizzes</button>
          <button onClick={() => window.location.reload()}>Retake Quiz</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="quiz-container">
      <h2>{quiz.title || 'Quiz'}</h2>
      <p className="quiz-info">
        {quiz.questions.length} Questions | 
        Answered: {Object.keys(answers).length}/{quiz.questions.length} | 
        <span className={timeLeft <= 10 ? 'time-warning' : 'time-left'}>Time Left: {timeLeft}s</span>
      </p>
      
      {quiz.questions.length === 0 ? (
        <p>No questions available for this quiz.</p>
      ) : (
        <>
          <div className="questions-list">
            {quiz.questions.map((question, index) => (
              <div key={question.questionId} className="question-card">
                <h4>Question {index + 1}: {question.question}</h4>
                <div className="options">
                  {question.options.map((option, optIndex) => (
                    <label 
                      key={optIndex} 
                      className={`option-label ${answers[question.questionId] === option ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name={question.questionId}
                        value={option}
                        checked={answers[question.questionId] === option}
                        onChange={() => handleOptionChange(question.questionId, option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="submit-container">
            <button 
              onClick={handleSubmit} 
              disabled={submitting || Object.keys(answers).length !== quiz.questions.length}
              className="submit-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
            <button onClick={() => navigate('/')} className="cancel-btn">
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Quiz;
