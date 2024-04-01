/* Week-4: /bookList.mjs
 * Define, and export, a series of functions instead of a class.
 * Change the name of the file to: bookList.mjs
 */
import bcrypt from 'bcrypt';
import { Book, Author, Editor, User, BookUser } from '../models/models.mjs';

/* 4.1.4: User registration function: */
async function registerUser(username, password) {
    try {
        if (!username || !password) {
            throw new Error('Λείπει το όνομα ή το συνθηματικό του χρήστη.');
        }
        let user = await User.findOne({ where: { name: username } });
        if (!user) {
            const hash = await bcrypt.hash(password, 10);
            user = await User.create({ name: username, password: hash });
            console.log('User:', user);
            return user;
        } else {
            throw new Error(`Το όνομα ${username} υπάρχει ήδη. Παρακαλώ χρησιμοποιήστε ένα άλλο όνομα.`);
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function login(username, password) {
    try {
        if (!username || !password) {
            throw new Error('Λείπει το όνομα ή το συνθηματικό του χρήστη.');
        }
        const user = await User.findOne({ where: { name: username } });
        if (!user) {
            throw new Error(`Δεν υπάρχει χρήστης με όνομα ${username}.`);
        }
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            return user;
        } else {
            throw new Error('Λάθος στοιχεία πρόσβασης. Προσπαθήστε ξανά.');
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function loadBooks(username) {
    try {
        if (!username) {
            throw new Error('Πρέπει να δωθεί όνομα χρήστη.');
        }
        const user = await User.findOne({ where: { name: username } });
        if (!user) {
            throw new Error('Αγνωστος χρήστης.');
        }
        const books = await Book.findAll({
            include: [Author, Editor,
                {
                    model: User,
                    where: { name: username }
                }],
            raw: true
        }); // v4.1.5 Because we need a JOIN we use this type of query.
        return books.map(book => {
            return (
                {
                    bookId: book.id,
                    bookTitle: book.title,
                    year: book.year,
                    authorName: book['Author.name'],
                    editor: book['Editor.name']
                }
            );
        });
        // console.log('loading...', this.myBooks);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function addBookFn(newBook, username) {
    try {
        if (!username) {
            throw new Error('Πρέπει να δωθεί όνομα χρήστη.');
        }
        const user = await User.findOne({ where: { name: username } });
        if (!user) {
            throw new Error('Αγνωστος χρήστης.')
        }
        const [author, author_result] = await Author.findOrCreate({ where: { name: newBook.author } });
        const [editor, editor_result] = await Editor.findOrCreate({ where: { name: newBook.editor } });
        const [book, book_result] = await Book.findOrCreate({ where: { title: newBook.title, year: newBook.year } });
        if (book_result === true) {
            await book.setAuthor(author);
            await book.setEditor(editor);
        }
        await user.addBook(book);
    } catch (error) {
        console.log(error);
        throw error;
    }

}

async function deleteBook(id, username) {
    try {
        if (!username) {
            throw new Error('Πρέπει να δωθεί όνομα χρήστη.');
        }
        const user = await User.findOne({ where: { name: username } });
        if (!user) {
            throw new Error('Αγνωστος χρήστης.')
        }

        const bookToRemove = await findBookById(id, false);
        // IMPORTANT: The helper method removeUser() works here BECAUSE the bookToRemove object is created with the flag rawFlag set to false!
        await bookToRemove.removeUser(user); // Unties the user in question from this particular book.
        // Return the count of users having this book, using the helper method countUsers() - rawFlag set to false!
        const numberOfUsers = await bookToRemove.countUsers();
        if (numberOfUsers === 0) { // No user is tied to this book! Delete book from Books.
            await Book.destroy({ where: { id } });
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/* This method is used by Deleted Book page to fetch the data of the book just deleted by the user. Since
 * the book can have been deleted entirely, this method MUST be called BEFORE the deleteBook method. */
async function findBookById(id, rawFlag) {
    try {
        const bookToQuery = await Book.findOne({ where: { id }, include: [Author, Editor], raw: rawFlag });
        return bookToQuery;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function checkBookUserIfExists(title, authorName, username) {
    try {
        if (!username) {
            throw new Error('Πρέπει να δωθεί όνομα χρήστη.');
        }
        const user = await User.findOne({ where: { name: username } });
        if (!user) {
            throw new Error('Αγνωστος χρήστης.');
        }
        const book = await Book.findOne({
            where: { title },
            include: {
                model: Author,
                where: { name: authorName }
            }
        });
        if (book) {
            const bookUser = await BookUser.findOne({ where: { BookId: book.id, UserName: username } });
            return bookUser;
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export { registerUser, login, loadBooks, addBookFn, checkBookUserIfExists, findBookById, deleteBook };



