import * as BookList from '../modules/bookList.mjs';
import { pages } from '../config/attributes.mjs';

function checkIfAuthenticated(req, res, next) {
    if (req.session.username) {
        next();
    } else {
        res.redirect('/login');
    }
}

async function doLogin(req, res, next) { // 2b. Use the next keyword because now, the middlewere has to continue to the next one.
    try {
        const user = await BookList.login(req.body.username, req.body.password);
        if (user) {
            req.session.username = req.body.username; // 1d. Save the username value as a session value
            next();
        } else {
            throw new Error('Αγνωστο σφάλμα');
        }
    } catch (error) {
        res.locals.pageTitle = pages.error.title;
        res.locals.mainId = pages.error.mainId;
        next(error);
    }
}

async function doRegister(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const user = await BookList.registerUser(username, password);
        if (user) {
            res.locals.pageTitle = pages.login.title;
            res.locals.mainId = pages.login.mainId;
            res.locals.loginActive = pages.login.loginActive;
            res.render('login', {
                newusermessage: `Η εγγραφή του χρήστη έγινε με επιτυχία. Τώρα μπορείτε να εισέρθετε
                στην εφαρμογή χρησιμοποιώντας τα διαπιστευτήρια που μόλις καταχωρήσατε.`});
        } else {
            throw new Error('Αγνωστο σφάλμα κατά την εγγραφή του χρήστη.');
        }
    } catch (error) {
        res.locals.pageTitle = pages.error.title;
        res.locals.mainId = pages.error.mainId;
        next(error);
    }
}

const doLogout = (req, res, next) => { // 3a. Logout middlewere, destroy session
    req.session.destroy();
    next();
}

export { checkIfAuthenticated, doLogin, doRegister, doLogout };