// backend/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const QRCode = require('qrcode');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Adjust as needed for security
    methods: ["GET", "POST"]
  }
});

// Serve static files if needed
app.use(express.static('public'));

// Sample Questions
const questions = [
  {
    question: "What is the capital of France?",
    answer: "Paris"
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    answer: "William Shakespeare"
  },
  {
    question: "What is the largest planet in our Solar System?",
    answer: "Jupiter"
  },
  {
    question: "In which year did the World War II end?",
    answer: "1945"
  },
  {
    question: "What is the chemical symbol for Gold?",
    answer: "Au"
  }
];

let currentQuestionIndex = 0;
let hostSocket = null;

// Handle Socket.IO Connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Identify the host
  io.on('host', async () => {
    console.log('Host connected:', socket.id);
    hostSocket = socket;
    sendQuestionToHost();
  });

  // Player joins
  socket.on('join', async () => {
    console.log('Player joined:', socket.id);
    // Send current question to the player
    socket.emit('question', {
      question: questions[currentQuestionIndex].question,
      questionNumber: currentQuestionIndex + 1
    });
  });

  // Player submits an answer
  socket.on('answer', (data) => {
    const { name, answer } = data;
    const correctAnswer = questions[currentQuestionIndex].answer.toLowerCase().trim();

    if (answer.toLowerCase().trim() === correctAnswer) {
      // Notify host
      if (hostSocket) {
        hostSocket.emit('correct', { name });
      }

      // Notify player
      socket.emit('result', { success: true, message: "Congratulations!" });

      // Move to next question after a short delay
      setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
          sendQuestionToHost();
          // Broadcast new question to all players
          socket.emit('question', {
            question: questions[currentQuestionIndex].question,
            questionNumber: currentQuestionIndex + 1
          });
        } else {
          // Game Over
          if (hostSocket) {
            hostSocket.emit('end', { message: "Game Over! Thank you for playing." });
          }
          io.emit('end', { message: "Game Over! Thank you for playing." });
        }
      }, 3000);
    } else {
      // Notify player
      socket.emit('result', { success: false, message: "Wrong Answer. Try next question!" });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket === hostSocket) {
      hostSocket = null;
    }
  });
});

// Function to send question to host and generate QR code
async function sendQuestionToHost() {
  if (hostSocket && currentQuestionIndex < questions.length) {
    const question = questions[currentQuestionIndex].question;
    hostSocket.emit('question', {
      question: question,
      questionNumber: currentQuestionIndex + 1
    });

    // Generate QR Code pointing to the player URL
    // Replace 'localhost:3000' with your server's IP/domain if accessing remotely
    const playerURL = `http://localhost:3000/player`; 
    const qrDataURL = await QRCode.toDataURL(playerURL);

    hostSocket.emit('qr', { qr: qrDataURL });
  } else if (hostSocket) {
    hostSocket.emit('end', { message: "Game Over! Thank you for playing." });
  }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
