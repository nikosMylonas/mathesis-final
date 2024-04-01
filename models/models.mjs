import { DataTypes } from "sequelize";
import { sequelize } from '../config/dbConfig.mjs';



const Book = sequelize.define('Book', {
    title: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER
    }
});

const Author = sequelize.define('Author', {
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    }
});

const Editor = sequelize.define('Editor', {
    name: {
        type: DataTypes.TEXT,
        allowNull: true,
        unique: true
    }
})

const User = sequelize.define('User', {
    name: {
        type: DataTypes.TEXT,
        primaryKey: true
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

const BookUser = sequelize.define('BookUser', {
    comment: {
        type: DataTypes.TEXT,
        defaultValue: null
    }
});

Author.hasMany(Book);
Book.belongsTo(Author);
Editor.hasMany(Book);
Book.belongsTo(Editor);
Book.belongsToMany(User, { through: BookUser });
User.belongsToMany(Book, { through: BookUser });

await sequelize.sync();

export { Book, Author, Editor, User, BookUser };