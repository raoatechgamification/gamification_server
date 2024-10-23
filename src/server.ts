import app from "./app";
import connectDB from "./config/db"

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectDB()
});
