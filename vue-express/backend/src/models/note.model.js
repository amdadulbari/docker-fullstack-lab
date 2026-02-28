import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      enum: {
        values: ['yellow', 'blue', 'green', 'pink', 'white'],
        message: '{VALUE} is not a supported color',
      },
      default: 'yellow',
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields automatically
  }
)

const Note = mongoose.model('Note', noteSchema)

export default Note
