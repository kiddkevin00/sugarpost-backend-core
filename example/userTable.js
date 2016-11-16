const Sequelize = require('sequelize');

const Conn = new Sequelize(process.env.DATABASE_URL);

module.exports = Conn.define('user', {
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userName: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: Sequelize.STRING,
  },
  twitter_id: {
    type: Sequelize.STRING,
  },
  google_id: {
    type: Sequelize.STRING,
  },
  facebook_id: {
    type: Sequelize.STRING,
  },
});
