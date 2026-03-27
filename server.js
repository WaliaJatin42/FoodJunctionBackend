const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const auditMiddleware = require("./middleware/auditMiddleware");
const setupSwagger = require("./config/swagger");

// Advanced Security Imports
// const mongoSanitize = require("express-mongo-sanitize");
// const xss = require("xss-clean");
// const hpp = require("hpp");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Make io accessible to our router
app.set("io", io);

// Security and utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Setup Swagger UI Documentation BEFORE restrictive payload sanitizers!
setupSwagger(app);

// Sanitize MongoDB Operator properties internally protecting against NoSQL payloads
// app.use((req, res, next) => {
//   if (req.body) mongoSanitize.sanitize(req.body);
//   if (req.query) mongoSanitize.sanitize(req.query);
//   if (req.params) mongoSanitize.sanitize(req.params);
//   next();
// });

// Intercept requested input escaping HTML variables and native script hooks preventing XSS
// app.use(xss());

// Strictly filter HTTP Parameter Pollution attempts natively inside queries matching duplicates
// app.use(hpp());
app.use(morgan("dev"));
app.use(auditMiddleware); // Logs all activity to daily files & DB

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per window
});
app.use("/api/", limiter);

// Basic route
app.get("/", (req, res) => {
  res.send("Cafe Backend is running...");
});

// Routes will be added here
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/deliveries", require("./routes/deliveryRoutes"));
app.use("/api/vendors", require("./routes/vendorRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
// Socket.io connection logic
io.on("connection", (socket) => {
  console.log(`User connected to socket: ${socket.id}`);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
