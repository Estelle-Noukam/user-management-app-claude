const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const pool = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const userValidators = [
  body('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/),
  body('email').trim().isEmail().normalizeEmail(),
  body('role').isIn(['admin', 'user']),
  body('first_name').trim().isLength({ max: 100 }).optional({ checkFalsy: true }),
  body('last_name').trim().isLength({ max: 100 }).optional({ checkFalsy: true }),
  body('bio').trim().isLength({ max: 1000 }).optional({ checkFalsy: true }),
];

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try { return res.json(await User.findAll()); }
  catch { return res.status(500).json({ error: 'Erreur serveur' }); }
});

router.get('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (req.session.role !== 'admin' && req.session.userId !== id)
    return res.status(403).json({ error: 'Accès refusé' });
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    return res.json(user);
  } catch { return res.status(500).json({ error: 'Erreur serveur' }); }
});

router.post('/', requireAuth, requireAdmin, [
  ...userValidators,
  body('password').isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  const { username, email, password, role, first_name, last_name, bio } = req.body;
  try {
    if (await User.emailExists(email))
      return res.status(409).json({ errors: [{ msg: 'E-mail déjà utilisé' }] });
    if (await User.usernameExists(username))
      return res.status(409).json({ errors: [{ msg: "Nom d'utilisateur déjà pris" }] });
    const user = await User.create({ username, email, password, role, first_name, last_name, bio });
    return res.status(201).json(user);
  } catch { return res.status(500).json({ error: 'Erreur serveur' }); }
});

router.put('/:id', requireAuth, requireAdmin, userValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  const id = parseInt(req.params.id);
  const { username, email, role, first_name, last_name, bio } = req.body;
  try {
    if (await User.emailExists(email, id))
      return res.status(409).json({ errors: [{ msg: 'E-mail déjà utilisé' }] });
    if (await User.usernameExists(username, id))
      return res.status(409).json({ errors: [{ msg: "Nom d'utilisateur déjà pris" }] });
    const user = await User.update(id, { username, email, role, first_name, last_name, bio });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    return res.json(user);
  } catch { return res.status(500).json({ error: 'Erreur serveur' }); }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (id === req.session.userId)
    return res.status(400).json({ error: 'Impossible de supprimer votre propre compte' });
  try {
    const ok = await User.delete(id);
    if (!ok) return res.status(404).json({ error: 'Utilisateur introuvable' });
    return res.json({ ok: true });
  } catch { return res.status(500).json({ error: 'Erreur serveur' }); }
});

router.put('/:id/profile', requireAuth, [
  body('email').trim().isEmail().normalizeEmail(),
  body('first_name').trim().isLength({ max: 100 }).optional({ checkFalsy: true }),
  body('last_name').trim().isLength({ max: 100 }).optional({ checkFalsy: true }),
  body('bio').trim().isLength({ max: 1000 }).optional({ checkFalsy: true }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  const id = parseInt(req.params.id);
  if (req.session.role !== 'admin' && req.session.userId !== id)
    return res.status(403).json({ error: 'Accès refusé' });
  const { email, first_name, last_name, bio } = req.body;
  try {
    if (await User.emailExists(email, id))
      return res.status(409).json({ errors: [{ msg: 'E-mail déjà utilisé' }] });
    const user = await User.updateProfile(id, { email, first_name, last_name, bio });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    return res.json(user);
  } catch { return res.status(500).json({ error: 'Erreur serveur' }); }
});

router.put('/:id/password', requireAuth, [
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/),
  body('confirm_password').custom((val, { req }) => {
    if (val !== req.body.new_password) throw new Error('Les mots de passe ne correspondent pas');
    return true;
  }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  const id = parseInt(req.params.id);
  if (req.session.role !== 'admin' && req.session.userId !== id)
    return res.status(403).json({ error: 'Accès refusé' });
  try {
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id=$1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Introuvable' });
    const ok = await User.verifyPassword(req.body.current_password, rows[0].password_hash);
    if (!ok) return res.status(401).json({ errors: [{ msg: 'Mot de passe actuel incorrect' }] });
    await User.updatePassword(id, req.body.new_password);
    return res.json({ ok: true });
  } catch { return res.status(500).json({ error: 'Erreur serveur' }); }
});

module.exports = router;
