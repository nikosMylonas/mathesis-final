import { body, validationResult } from 'express-validator';
import validator from 'validator';
import { pages } from '../config/attributes.mjs';

const validateLogin = [
    body('username') // 1c. Validate username input
        .notEmpty()
        .withMessage('Το πεδίο είναι υποχρεωτικό')
        .isAlpha()
        .withMessage('Επιτρέπονται μόνο λατινικοί χαρακτήρες')
        .escape()
        .trim(),
    body('password') // 4. User authentication
        .notEmpty()
        .withMessage('Το πεδίο είναι υποχρεωτικό')
        .isAlphanumeric()
        .isLength({ min: 4, max: 10 })
        .withMessage('Το συνθηματικό πρέπει να αποτελείται απο 4 έως 10 χαρακτήρες')
        .escape()
        .trim(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            next();
        } else {
            res.locals.pageTitle = pages.login.title;
            res.locals.mainId = pages.login.mainId;
            res.locals.loginActive = pages.login.loginActive;
            res.render('login', {
                message: errors.mapped()
            });
        }
    }
];
const validateNewBook = [
    body('title')
        .notEmpty()
        .withMessage('Το πεδίο είναι υποχρεωτικό')
        .isLength({ min: 3 })
        .withMessage('Απαιτούνται τουλάχιστον 3 χαρακτήρες')
        .isAlpha('el-GR', { ignore: '\s.,\'1234567890' })
        .withMessage('Επιτρέπονται μόνο ελληνικοί χαρακτήρες'),
    body('author')
        .notEmpty()
        .withMessage('Το πεδίο είναι υποχρεωτικό')
        .isLength({ min: 3 })
        .withMessage('Απαιτούνται τουλάχιστον 3 χαρακτήρες')
        .isAlpha('el-GR', { ignore: '/s.,\'' })
        .withMessage('Επιτρέπονται μόνο ελληνικοί χαρακτήρες'),
    body('editor')
        .notEmpty()
        .withMessage('Το πεδίο είναι υποχρεωτικό')
        .isLength({ min: 2 })
        .withMessage('Απαιτούνται τουλάχιστον 3 χαρακτήρες')
        .isAlpha('el-GR', { ignore: '\s1234567890' }),
    body('year')
        .notEmpty()
        .withMessage('Το πεδίο είναι υποχρεωτικό')
        .isInt()
        .withMessage('Εισάγετε το Ετος σε μορφή YYYY (Από 1990 και μετά)')
        .isLength({ min: 4, max: 4 })
        .withMessage('Εισάγετε το Ετος σε μορφή YYYY (Από 1990 και μετά)')
        .custom(value => {
            if (value < 1990 || value > new Date().getFullYear()) {
                throw new Error('Μη αποδεκτό έτος')
            } else {
                return true;
            }
        }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            next()

        } else {
            res.locals.username = req.session.username;
            res.locals.pageTitle = pages.addForm.title;
            res.locals.mainId = pages.addForm.mainId;
            res.locals.addFormActive = pages.addForm.addFormActive;
            res.render('bookform', {
                message: errors.mapped(),
                author: req.body.author,
                title: req.body.title,
                editor: req.body.editor,
                year: req.body.year
            });
        }
    }
];

const validateNewUser = [
    body('username')
        .trim().escape().isLength({ min: 4 })
        .isAlpha()
        .withMessage('Το όνομα πρέπει να αποτελείται από τουλάχιστον 4 λατινικούς χαρακτήρες'),
    body('password')
        .trim().escape().isLength({ min: 4, max: 10 })
        .isAlphanumeric()
        .withMessage('Το συνθηματικό πρέπει να αποτελείται απο 4 έως 10 χαρακτήρες (λατινικά γράμματα ή αριθμούς)'),
    body('password-confirm')
        .trim().escape().isLength({ min: 4, max: 10 })
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Το συνθηματικό πρέπει να είναι το ίδιο και στα δύο πεδία.');
            } else {
                return true;
            }
        }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            next();
        } else {
            res.locals.pageTitle = pages.register.title;
            res.locals.mainId = pages.register.mainId;
            res.locals.registerActive = pages.register.registerActive;
            res.render('registration', {
                message: errors.mapped()
            });
        }
    }
]

export { validateLogin, validateNewBook, validateNewUser };
