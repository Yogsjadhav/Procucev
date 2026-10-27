import mongoose from 'mongoose';

const transcriptionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Transcription text is required'],
      trim: true,
    },
    language: {
      type: String,
      default: 'en-US',
      trim: true,
    },
    detectedLanguages: {
      type: [String],
      default: [],
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    duration: {
      type: Number, // Duration in seconds
      default: 0,
    },
    userId: {
      type: String,
      default: 'anonymous',
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Index for faster queries
transcriptionSchema.index({ createdAt: -1 });
transcriptionSchema.index({ userId: 1 });
transcriptionSchema.index({ language: 1 });

// Virtual for formatted date
transcriptionSchema.virtual('formattedDate').get(function () {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

// Ensure virtuals are included in JSON output
transcriptionSchema.set('toJSON', { virtuals: true });
transcriptionSchema.set('toObject', { virtuals: true });

const Transcription = mongoose.model('Transcription', transcriptionSchema);

export default Transcription;
