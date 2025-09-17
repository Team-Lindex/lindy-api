import express from 'express';
import { processVoiceForOutfit, upload } from '../controllers/voiceController';
import { mockController, processTextForOutfit, processTextForOutfitTest } from '../controllers/textOutfitController';

const router = express.Router();

// POST /api/voice/outfit - Process voice input to generate an outfit
router.post('/outfit', upload.single('audio'), processVoiceForOutfit);

// POST /api/voice/text-outfit - Process text input to generate an outfit
router.post('/text-outfit', processTextForOutfit);

router.get('/mock', mockController);

router.post('/text-outfit-test', processTextForOutfitTest);

export default router;
