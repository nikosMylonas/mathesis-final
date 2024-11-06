import * as BookList from '../modules/bookList.js';
import { pages } from '../config/attributes.js';


async function showBookList(req, res, next) { // 2a. Create a function showBookList to use it in several middleweres
    res.locals.username = req.session.username; // This variable (username) is available to the template
    res.locals.pageTitle = pages.bookList.title;
    res.locals.mainId = pages.bookList.mainId;
    res.locals.bookListActive = pages.bookList.bookListActive;
    try {
        const myBooks = await BookList.loadBooks(req.session.username);

        res.render('booklist', { books: myBooks });
    } catch (error) {
        res.locals.pageTitle = pages.error.title;
        res.locals.mainId = pages.error.mainId;
        next(error);
    }
}

async function addNewBook(req, res, next) {
    const newBook = {
        author: req.body.author,
        title: req.body.title,
        editor: req.body.editor,
        year: req.body.year
    }
    try {
        res.locals.username = req.session.username;
        res.locals.title = req.body.title;
        res.locals.author = req.body.author;
        res.locals.editor = req.body.editor;
        res.locals.year = req.body.year;
        res.locals.pageTitle = pages.addedBook.title;
        res.locals.mainId = pages.addedBook.mainId;
        /* v3.3.2 Check if the book provided by the user, already exists. */
        const bookUser = await BookList.checkBookUserIfExists(res.locals.title, res.locals.author, res.locals.username);
        let bookUserCheck = true; // v3.3.2 Book already exists
        /* v4.1.5 IMPORTANT! Because in week-4 we don't use a class and subsequently a class initialization,
        the value of the bookUser variable can be accessed directly by the return of the checkBookUserIfExists()
        function. */
        if (bookUser === null) { // v3.3.2 If the book/user doesn't exist change the value of the check variable to false.
            bookUserCheck = false;
        }
        res.locals.bookUserCheck = bookUserCheck;
        await BookList.addBookFn(newBook, req.session.username);
        res.render('addedbook');

    } catch (error) {
        res.locals.pageTitle = pages.error.title;
        res.locals.mainId = pages.error.mainId;
        next(error);
    }
}

/* Τελική εργασία: Εμφάνιση σχολίων για κάποιο βιβλίο */

async function showComments(req, res, next) {
    const id = req.params.id;

    try {
        res.locals.username = req.session.username; // This variable (username) is available to the template
        res.locals.pageTitle = pages.commentForm.title;
        res.locals.mainId = pages.commentForm.mainId;
        res.locals.addCommentActive = pages.commentForm.addCommentActive;

        const book = await BookList.findBookById(id, true);

        /* Περνώντας την παράμετρο true (-> {raw: true}), μπορώ να χρησιμοποιήσω την ιδιότητα include στην αναζήτηση
         * του βιβλίου (αντίστοιχο με JOIN στην SQL), δεν μπορώ όμως να χρησιμοποιήσω την βοηθητική μέθοδο book.getAuthor().
         * Αντίθετα, αν χρησιμοποιήσω την τιμή false (-> {raw:false}), μπορώ να χρησιμοποιήσω την ανωτέρω βοηθητική μέθοδο.
         * Προτίμησα την πρώτη επιλογή καθώς μου επιστρέφει ένα Promise, όχι 1+1 όπως η δεύτερη (Ενα για την book και ένα
         * για την book.getAuthor()) */

        const comments = await BookList.loadAllComments(req.session.username, book.id);

        //Ενεργά σχόλια:
        const activeComments = comments.filter((comment) => comment.comment !== null);
        const numberComments = activeComments.length;

        /* Σχόλιο του τρέχοντος χρήστη. Χρησιμοποιείται στο πεδίο 'Σχόλια" της φόρμας*/
        const commentUser = activeComments.find((comment) => comment.UserName === req.session.username);
        const currentComment = commentUser?.comment ? commentUser.comment : '';


        res.render('commentsform', { bookId: book.id, bookTitle: book.title, authorName: book['Author.name'], activeComments, numberComments, currentComment });
    } catch (error) {
        res.locals.pageTitle = pages.error.title;
        res.locals.mainId = pages.error.mainId;
        next(error);
    }
}

/* Τελική εργασία: Προσθήκη σχολίου για κάποιο βιβλίο */
async function addNewComment(req, res, next) {
    /* Κρυφό πεδίο της φόρμας. Ετσι παρέχεται στη διαδρομή το ID του βιβλίου,
    για να το χρησιμοποιήσουμε αργότερα */
    const id = req.body.bookId;
    const newComment = req.body.comment;

    try {
        res.locals.username = req.session.username;
        res.locals.pageTitle = pages.commentForm.title;
        res.locals.mainId = pages.commentForm.mainId;
        res.locals.addCommentActive = pages.commentForm.addCommentActive;

        await BookList.addComment(newComment, req.session.username, id);

        /* Redirect στο endpoint της φόρμας και της λίστας σχολίων. Με αυτόν τον τρόπο,
        υποβάλλοντας κάποιο σχόλιο, εμφανίζεται στην "ανανεωμένη" σελίδα. */
        res.redirect(`/comments/${id}`);

    } catch (error) {
        res.locals.pageTitle = pages.error.title;
        res.locals.mainId = pages.error.mainId;
        next(error);
    }
}

async function deleteBook(req, res, next) {
    const id = req.params.id;
    try {

        /* v3.3.2 Save the book to delete to a variable. That way the book-to-be-deleted
        details will be displayed in a message to the user as a confirmation. */
        const bookToDelete = await BookList.findBookById(id, true);
        await BookList.deleteBook(id, req.session.username);
        /* Pass all book-to-be-deleted details to handlebars */
        res.locals.username = req.session.username;
        res.locals.title = bookToDelete.title;
        res.locals.author = bookToDelete['Author.name'];
        res.locals.editor = bookToDelete['Editor.name'];
        res.locals.year = bookToDelete.year;
        res.locals.pageTitle = pages.deletedBook.title;
        res.locals.mainId = pages.deletedBook.mainId;
        res.render('deletedbook');
    } catch (error) {
        res.locals.pageTitle = pages.error.title;
        res.locals.mainId = pages.error.mainId;
        next(error);
    }
}

export { showBookList, addNewBook, deleteBook, showComments, addNewComment };