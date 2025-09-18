import server from "./src/app.js";

const PORT = process.env.PORT || 3052;

server.listen(PORT, () => {
    console.log(`Server is starting with Port: ${PORT}`);
});

// Graceful shutdown (both Ctrl+C locally and Render SIGTERM)
process.once("SIGINT", () => {
    server.close(() => {
        console.log("Exit Server Express");
        process.exit(0);
    });
});

process.once("SIGTERM", () => {
    server.close(() => {
        console.log("Exit Server Express");
        process.exit(0);
    });
});
