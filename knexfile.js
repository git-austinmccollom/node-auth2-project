// Update with your config settings.

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
        // will generate food.db3 database file
      filename: './database/users.db3'
    },
    useNullAsDefault: true,
    // needed when using foreign keys
    pool: {
        afterCreate: (conn, done) => {
        // runs after a connection is made to the sqlite engine
        conn.run('PRAGMA foreign_keys = ON', done); // turn on FK enforcement
        }
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
