// frontend/src/Host.js
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { QRCodeCanvas } from 'qrcode.react';

const ENDPOINT = "http://localhost:5000"; // Update if backend is hosted elsewhere

let socket;

function Host() {
  const [question, setQuestion] = useState("Loading question...");
  const [qrCode, setQrCode] = useState("");
  const [congrats, setCongrats] = useState("");

  useEffect(() => {
    socket = io(ENDPOINT);

    // Identify as host
    socket.emit('host');

    // Receive question from server
    socket.on('question', (data) => {
      setQuestion(`Q${data.questionNumber}: ${data.question}`);
      setCongrats("");
    });

    // Receive QR code from server
    socket.on('qr', (data) => {
      setQrCode(data.qr);
    });

    // Receive correct answer notification
    socket.on('correct', (data) => {
      setCongrats(`Congratulations ${data.name}!`);
    });

    // Receive end of game
    socket.on('end', (data) => {
      setQuestion(data.message);
      setQrCode("");
      setCongrats("");
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={styles.container}>
      <h1>KBC-Style Game - Host Interface</h1>
      <div style={styles.question}>{question}</div>
      {qrCode && (
        <div style={styles.qrCode}>
          <QRCodeCanvas value="http://localhost:3000/player" size={256} />
          <p>Scan to join the game</p>
        </div>
      )}
      {congrats && <div style={styles.congrats}>{congrats}</div>}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    padding: '50px'
  },
  question: {
    fontSize: '24px',
    marginBottom: '20px'
  },
  qrCode: {
    marginTop: '20px'
  },
  congrats: {
    color: 'green',
    fontSize: '20px',
    marginTop: '20px'
  }
};

export default Host;
