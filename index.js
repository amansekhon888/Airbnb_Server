import "dotenv/config";
import app from "./app.js";
import connectDatabase from "./src/config/db.js";

connectDatabase();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}/`);
});
