const ENVIRONMENT = {
  LOCATION: process.env.NODE_ENV,
  TEST_ENV: process.env.TEST_ENV,
  SERVICE_WORKER_ON: process.env.SERVICE_WORKER_ON?.toLowerCase() === "true",
  BACKEND_URL:
    process.env.BACKEND_URL ??
    (process.env.NODE_ENV === "development"
      ? process.env.SERVICE_WORKER_ON?.toLowerCase() !== "false"
        ? "http://localhost:80" // standard webapp localhost (mock data)
        : "http://127.0.0.1:8000" // standard backend localhost (real data from backend)
      : "http://hatemate-backend:8000"), // published backend (real data from published backend)
};

export default ENVIRONMENT;
