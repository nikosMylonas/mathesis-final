import express from 'express';
import * as Validation from '../validator/validation.mjs';
import * as UserController from '../controller/user_controller.mjs';
import * as BooksController from '../controller/books_controller.mjs';
import { pages, currentYear } from '../config/attributes.mjs';

const router = express.Router();

router.use(express.urlencoded({ extended: false }));

/* MIddleware to pass the currentYear property globally. The Current Year is used in footer's copyright.
 * Because this middleware defines a property (currentYear) which is used in EVERY page, it MUST be 
 * called BEFORE any requested path that resolves to a page, so that it passes that property to that page. */
router.use((req, res, next) => {
    res.locals.currentYear = currentYear;
    next();
});

router.get('/', (req, res) => {
    res.locals.pageTitle = pages.home.title;
    res.locals.mainId = pages.home.mainId;
    res.locals.homeActive = pages.home.homeActive;
    if (req.session.username) {
        res.locals.username = req.session.username; // Home page when user is authenticated.
    }
    res.render('home');
});

/* 4.1.4 Define the handler for GET /register */
router.get('/register', (req, res) => {
    res.locals.pageTitle = pages.register.title;
    res.locals.mainId = pages.register.mainId;
    res.locals.registerActive = pages.register.registerActive;
    res.render('registration');
});

/* 4.1.4 Define the handler for POST /doregister */
router.post('/doregister',
    Validation.validateNewUser,
    UserController.doRegister
);

/* 1a. Render the login form */
router.get('/login', (req, res) => {
    res.locals.pageTitle = pages.login.title;
    res.locals.mainId = pages.login.mainId;
    res.locals.loginActive = pages.login.loginActive;
    res.render('login');
});

router.get('/books',
    UserController.checkIfAuthenticated,
    BooksController.showBookList);

router.post('/books',
    Validation.validateLogin,
    UserController.doLogin,
    BooksController.showBookList
);

router.get('/addbookform',
    UserController.checkIfAuthenticated,
    (req, res) => {
        res.locals.username = req.session.username;
        res.locals.pageTitle = pages.addForm.title;
        res.locals.mainId = pages.addForm.mainId;
        res.locals.addFormActive = pages.addForm.addFormActive;
        res.render('bookform');
    });

router.post('/doaddbook',
    UserController.checkIfAuthenticated,
    Validation.validateNewBook,
    BooksController.addNewBook
);

/* Middleware to delete a book. When we turn this to a REST API, we need to replace this middlewere 
with a router.delete() method. */
router.get('/delete/:id',
    UserController.checkIfAuthenticated,
    BooksController.deleteBook
);

router.get('/logout',
    UserController.checkIfAuthenticated,
    UserController.doLogout,
    (req, res) => {
        res.redirect('/');
    }
);

/* This middleware MUST come LAST, to ensure that ANY other requested path, different to the paths, for which
 * special handlers are defined in the router will be redirected to the Home page. If we place this middleware
 * above any path handler, this middleware would have intercepted that path first, and would have caused
 * a redirection instead of the proper handling of the path in question. */
router.use((req, res) => {
    res.redirect('/'); // 1b. Redirect any other endpoint to root (3.1.5)
});

export { router };

