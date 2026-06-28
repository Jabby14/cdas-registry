app.use(cors({
  origin: [
    "https://cdas-registery.netlify.app",
    "http://localhost:5173"
  ],
  credentials: true
}));