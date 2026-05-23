const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const registerValidators = [
  body('username').trim().isLength({ min: 3, max: 50 })
    .withMessage("Nom d'utilisateur : 3–50 caractères")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Nom d'utilisateur : lettres, chiffres et _ uniquement"),
  body('email').trim().isEmail().normalizeEmail().withMessage('Adresse e-mail invalide'),
  body('password').isLength({ min: 8 }).withMessage('Mot de passe : minimum 8 caractères')
    .matches(/[A-Z]/).withMessage('Mot de passe : au moins une majuscule')
    .matches(/[0-9]/).withMessage('Mot de passe : au moins un chiffre'),
  body('confirm_password').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Les mots de passe ne correspondent pas');
    return true;
  }),
];

const loginValidators = [
  body('email').trim().isEmail().normalizeEmail().withMessage('E-mail invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
];

router.post('/register', registerValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  const { username, email, password, first_name, last_name } = req.body;
  try {
    if (await User.emailExists(email))
      return res.status(409).json({ errors: [{ msg: 'Cet e-mail est déjà utilisé' }] });
    if (await User.usernameExists(username))
      return res.status(409).json({ errors: [{ msg: "Ce nom d'utilisateur est déjà pris" }] });
    const user = await User.create({ username, email, password, first_name: first_name || '', last_name: last_name || '' });
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.username = user.username;
    return res.status(201).json({ user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errors: [{ msg: 'Erreur serveur' }] });
  }
});

router.post('/login', loginValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user || !(await User.verifyPassword(password, user.password_hash)))
      return res.status(401).json({ errors: [{ msg: 'Identifiants incorrects' }] });
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ errors: [{ msg: 'Erreur session' }] });
      req.session.userId = user.id;
      req.session.role = user.role;
      req.session.username = user.username;
      return res.json({ user: { id: user.id, username: user.username, role: user.role } });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errors: [{ msg: 'Erreur serveur' }] });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    res.clearCookie('connect.sid');
    return res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Non authentifié' });
  return res.json({ id: req.session.userId, username: req.session.username, role: req.session.role });
});

module.exports = router;
