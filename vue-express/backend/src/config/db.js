import mongoose from 'mongoose'

/**
 * connectDB — establishes a connection to MongoDB using Mongoose.
 * Called once at server startup before app.listen().
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`)
    process.exit(1)
  }
}

export default connectDB
