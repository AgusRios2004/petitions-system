const app = require("./app");
const PORT = process.env.PORT || 3000;
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

// 1. Creamos un servidor HTTP nativo de Node, usando la app de Express para manejar las rutas.
const server = http.createServer(app);

// 2. Inicializamos Socket.IO, adjuntándolo al servidor HTTP y configurando CORS.
const io = new Server(server, {
  cors: {
    origin: "*", // En producción, deberías restringir esto a tu dominio del frontend.
    methods: ["GET", "POST"],
  },
});

// 3. Mapa para rastrear usuarios conectados: { userId: socketId }
const userSocketMap = new Map();

// 4. Inyectamos 'io' y 'userSocketMap' en la app de Express para que los servicios puedan usarlos.
app.set("io", io);
app.set("userSocketMap", userSocketMap);

// 5. Middleware de autenticación para Sockets
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: Token no proporcionado."));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error: Token inválido."));
    }
    
    socket.userId = decoded.sub;
    next();
  });
});

io.on("connection", (socket) => {
  console.log(`🟢 Usuario conectado: ${socket.userId} con socket ID: ${socket.id}`);
  userSocketMap.set(socket.userId, socket.id);

  socket.on("disconnect", () => {
    console.log(`🔴 Usuario desconectado: ${socket.userId}`);
    userSocketMap.delete(socket.userId);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
