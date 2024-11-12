import app from "./app";
import connectDB from "./config/db"

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectDB()
});


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MzFmMjBjZWM1YWRmNDNiNjhkNDNkNyIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJBamliYWRlIE9yZyIsImVtYWlsIjoiYWppYmFkZWVtbWFudWVsNThAZ21haWwuY29tIiwicHJlZmVycmVkVXJsIjoiaHR0cHM6Ly9hankuY29tIiwiaWF0IjoxNzMxMzI2NTQzLCJleHAiOjE3MzE0MTI5NDN9.tWxpAP8-dgL61rL7S_kaFPzHSZdPJamaSYnkpS4qoS4