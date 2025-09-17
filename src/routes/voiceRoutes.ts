import express from 'express';
import { processVoiceForOutfit, upload } from '../controllers/voiceController';
import { processTextForOutfit } from '../controllers/textOutfitController';

const router = express.Router();

// POST /api/voice/outfit - Process voice input to generate an outfit
router.post('/outfit', upload.single('audio'), processVoiceForOutfit);

// POST /api/voice/text-outfit - Process text input to generate an outfit
router.post('/text-outfit', processTextForOutfit);

export default router;
