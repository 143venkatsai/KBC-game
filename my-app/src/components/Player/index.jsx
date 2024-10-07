// frontend/src/Player.js
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const ENDPOINT = "http://localhost:5000"; // Update if backend is hosted elsewhere

let socket;

function Player() {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [question, setQuestion] = useState("Waiting for question...");
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    socket = io(ENDPOINT);

    // Listen for question updates
    socket.on('question', (data) => {
      setQuestion(`Q${data.questionNumber}: ${data.question}`);
      setResult('');
    });

    // Listen for result of the answer
    socket.on('result', (data) => {
      if (data.success) {
        setResult(`✅ ${data.message}`);
      } else {
        setResult(`❌ ${data.message}`);
      }
    });

    // Listen for end of game
    socket.on('end', (data) => {
      setQuestion(data.message);
      setResult('');
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const joinGame = () => {
    if (name.trim() === '') {
      alert('Please enter your name.');
      return;
    }
    socket.emit('join');
    setJoined(true);
  };

  const submitAnswer = () => {
    if (answer.trim() === '') {
      alert('Please enter an answer.');
      return;
    }
    socket.emit('answer', { name, answer });
    setAnswer('');
  };

  return (
    <div style={styles.container}>
      <h1>KBC-Style Game - Player Interface</h1>
      {!joined ? (
        <div style={styles.login}>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
          <button onClick={joinGame} style={styles.button}>Join Game</button>
        </div>
      ) : (
        <div style={styles.game}>
          <div style={styles.question}>{question}</div>
          <input
            type="text"
            placeholder="Your Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={styles.input}
          />
          <button onClick={submitAnswer} style={styles.button}>Submit</button>
          {result && <div style={styles.result}>{result}</div>}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    padding: '50px'
  },
  login: {
    marginTop: '20px'
  },
  game: {
    marginTop: '20px'
  },
  question: {
    fontSize: '24px',
    marginBottom: '20px'
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    width: '60%',
    maxWidth: '300px',
    marginBottom: '10px'
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  result: {
    marginTop: '20px',
    fontWeight: 'bold'
  }
};

export default Player;
