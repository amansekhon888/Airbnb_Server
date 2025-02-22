import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...");
    const connection = await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit process on failure
  }
};

export default connectDatabase;
