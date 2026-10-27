import express from 'express';
import Transcription from '../models/Transcription.js';

const router = express.Router();

// GET all transcriptions with optional filters and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      language,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (language) query.language = language;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: order === 'desc' ? -1 : 1 },
    };

    const transcriptions = await Transcription.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .exec();

    const total = await Transcription.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transcriptions,
      pagination: {
        total,
        page: options.page,
        limit: options.limit,
        pages: Math.ceil(total / options.limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transcriptions',
      error: error.message,
    });
  }
});

// GET single transcription by ID
router.get('/:id', async (req, res) => {
  try {
    const transcription = await Transcription.findById(req.params.id);

    if (!transcription) {
      return res.status(404).json({
        success: false,
        message: 'Transcription not found',
      });
    }

    res.status(200).json({
      success: true,
      data: transcription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transcription',
      error: error.message,
    });
  }
});

// POST create new transcription
router.post('/', async (req, res) => {
  try {
    const {
      text,
      language,
      detectedLanguages,
      confidence,
      duration,
      userId,
      metadata,
    } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Transcription text is required',
      });
    }

    const transcription = await Transcription.create({
      text,
      language,
      detectedLanguages,
      confidence,
      duration,
      userId,
      metadata,
    });

    res.status(201).json({
      success: true,
      message: 'Transcription created successfully',
      data: transcription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating transcription',
      error: error.message,
    });
  }
});

// PUT update transcription by ID
router.put('/:id', async (req, res) => {
  try {
    const {
      text,
      language,
      detectedLanguages,
      confidence,
      duration,
      userId,
      metadata,
    } = req.body;

    const transcription = await Transcription.findById(req.params.id);

    if (!transcription) {
      return res.status(404).json({
        success: false,
        message: 'Transcription not found',
      });
    }

    // Update fields
    if (text !== undefined) {
      transcription.text = text;
      transcription.isEdited = true;
    }
    if (language !== undefined) transcription.language = language;
    if (detectedLanguages !== undefined) transcription.detectedLanguages = detectedLanguages;
    if (confidence !== undefined) transcription.confidence = confidence;
    if (duration !== undefined) transcription.duration = duration;
    if (userId !== undefined) transcription.userId = userId;
    if (metadata !== undefined) transcription.metadata = { ...transcription.metadata, ...metadata };

    await transcription.save();

    res.status(200).json({
      success: true,
      message: 'Transcription updated successfully',
      data: transcription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating transcription',
      error: error.message,
    });
  }
});

// DELETE transcription by ID
router.delete('/:id', async (req, res) => {
  try {
    const transcription = await Transcription.findByIdAndDelete(req.params.id);

    if (!transcription) {
      return res.status(404).json({
        success: false,
        message: 'Transcription not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transcription deleted successfully',
      data: transcription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting transcription',
      error: error.message,
    });
  }
});

// DELETE all transcriptions (optional - for testing/admin)
router.delete('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId } : {};

    const result = await Transcription.deleteMany(query);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} transcription(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting transcriptions',
      error: error.message,
    });
  }
});

// GET statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId } : {};

    const total = await Transcription.countDocuments(query);
    const languageStats = await Transcription.aggregate([
      { $match: query },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recentTranscriptions = await Transcription.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('text language createdAt');

    res.status(200).json({
      success: true,
      data: {
        total,
        languageStats,
        recentTranscriptions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
});

export default router;
