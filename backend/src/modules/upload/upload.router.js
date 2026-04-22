const router = require('express').Router();
const { cloudinary, upload } = require('../../config/cloudinary');
const { authenticate } = require('../../middleware/auth');
const db = require('../../config/database');

// ── POST /api/upload/image ───────────────────────────────────────────────────
// Upload d'une image ou d'un PDF vers Cloudinary
router.post('/image', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier fourni.' });
  }

  const b64     = Buffer.from(req.file.buffer).toString('base64');
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    folder:         'entraide-academique',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });

  res.json({ url: result.secure_url, public_id: result.public_id });
});

// ── DELETE /api/upload/:publicId ─────────────────────────────────────────────
// Supprimer un fichier de Cloudinary
router.delete('/:publicId', authenticate, async (req, res) => {
  await cloudinary.uploader.destroy(req.params.publicId);
  res.status(204).end();
});

module.exports = router;
