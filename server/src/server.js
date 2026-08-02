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

// Fallback Route Aliases (in case VITE_API_URL omits /api/v1)
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/hospitals', hospitalRoutes);
app.use('/doctors', doctorRoutes);
app.use('/reception', receptionRoutes);
app.use('/patients', patientRoutes);
app.use('/pharmacy', pharmacyRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'AegisCare Enterprise Multi-Tenant Hospital Management Platform API',
    version: '1.0.0',
    healthCheck: '/api/health',
    apiBase: '/api/v1'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Hospital Management Platform API',
    version: '1.0.0',
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Hospital Management Platform API Server listening on port ${PORT}`);
  });
});
