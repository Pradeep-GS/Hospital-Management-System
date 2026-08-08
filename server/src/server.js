const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const { connectDB } = require('./config/db');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const receptionRoutes = require('./routes/receptionRoutes');
const patientRoutes = require('./routes/patientRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const aiRoutes = require('./routes/aiRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const { startReminderScheduler } = require('./services/reminderScheduler');

const app = express();
const server = http.createServer(app);

// CORS Setup — Bulletproof for Vercel + Render Deployment
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Preflight OPTIONS handler
app.options('*', cors());
app.use(express.json());

// Initialize Socket.io Real-time Queue Gateway
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('⚡ Socket client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 Socket client disconnected:', socket.id);
  });
});

// Primary API Routes (/api/v1/...)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/reception', receptionRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/pharmacy', pharmacyRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/reminders', reminderRoutes);

// Fallback Route Aliases (in case VITE_API_URL omits /api/v1)
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/hospitals', hospitalRoutes);
app.use('/doctors', doctorRoutes);
app.use('/reception', receptionRoutes);
app.use('/patients', patientRoutes);
app.use('/pharmacy', pharmacyRoutes);
app.use('/ai', aiRoutes);
app.use('/reminders', reminderRoutes);

// Serve static frontend assets if client dist exists
const path = require('path');
const clientDistPath = path.join(__dirname, '../../client/dist');
const fs = require('fs');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Hospital Management Platform API',
    version: '1.0.0',
    timestamp: new Date()
  });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/ai') || req.path.startsWith('/doctors') || req.path.startsWith('/patients')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.json({
    status: 'ONLINE',
    service: 'AegisCare Enterprise Multi-Tenant Hospital Management Platform API',
    version: '1.0.0',
    healthCheck: '/api/health',
    apiBase: '/api/v1'
  });
});

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Hospital Management Platform API Server listening on port ${PORT}`);
    startReminderScheduler(60000); // Poll upcoming appointment reminders every 60s
  });
});
