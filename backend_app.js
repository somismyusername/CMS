const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors'); 
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://127.0.0.1:5500', // Your frontend's origin
    methods: ['GET', 'POST'], // Allowed methods
    credentials: true, // Allow cookies if needed
  },
  pingTimeout: 60000, // Default is 5000ms
  pingInterval: 25000, // Default is 25000ms
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', (reason) => {
      console.log('A user disconnected:', reason);
  });
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/complaintManagement', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema and model definition
const complaintSchema = new mongoose.Schema({
  name: String,
  address: String,
  contact: String,
  email: String,
  description: String,
  status: { type: String, default: 'Pending' },
  imageUrl: String,
  date: { type: Date, default: Date.now },
});

const Complaint = mongoose.model('Complaint', complaintSchema);

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// File upload configuration
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Serve mainpage.html for root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'mainpage.html'));
});

// API Routes
app.post('/api/complaints', upload.single('image'), async (req, res) => {
  try {
    const { name, address, contact, email, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const complaint = new Complaint({
      name,
      address,
      contact,
      email,
      description,
      imageUrl,
    });
    await complaint.save();

    io.emit('newComplaint', complaint); // Notify all clients
    res.status(201).json(complaint);
  } catch (error) {
    console.error('Error saving complaint:', error);
    res.status(500).json({ error: 'Failed to save complaint' });
  }
});

app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ date: -1 });
    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});
// DELETE: Remove a complaint
app.delete('/api/complaints/:id', async (req, res) => {
  try {
      const { id } = req.params;

      // Verify and delete complaint
      const deletedComplaint = await Complaint.findByIdAndDelete(id);

      if (!deletedComplaint) {
          return res.status(404).json({ error: 'Complaint not found' });
      }

      io.emit('complaintDeleted', { id }); // Notify connected clients
      res.status(200).json({ message: 'Complaint deleted successfully' });
  } catch (error) {
      console.error('Error deleting complaint:', error);
      res.status(500).json({ error: 'Failed to delete complaint' });
  }
});
// Start server
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
