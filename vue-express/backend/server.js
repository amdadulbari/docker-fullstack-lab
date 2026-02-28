import 'dotenv/config'
import connectDB from './src/config/db.js'
import app from './src/app.js'

const PORT = process.env.PORT || 5000

const start = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
