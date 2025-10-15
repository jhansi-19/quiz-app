import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import QuizList from './components/QuizList';
import Quiz from './components/Quiz';
import Scores from './components/Scores';
import '@aws-amplify/ui-react/styles.css';

function App() {
  return (
    <Authenticator loginMechanisms={['email']} signUpAttributes={['email']}>
      {({ signOut, user }) => (
        <Router>
          <div className="app-container">
            <header className="app-header">
              <h1>Quiz Master</h1>
              <button className="signout-btn" onClick={signOut}>Sign Out</button>
            </header>
            <main>
              <Routes>
                <Route path="/" element={<QuizList user={user} />} />
                <Route path="/quizzes/:quizId" element={<Quiz user={user} />} />
                <Route path="/scores" element={<Scores user={user} />} />
              </Routes>
            </main>
            <footer>© 2025 Quiz App - Powered by xAI</footer>
          </div>
        </Router>
      )}
    </Authenticator>
  );
}

export default App;