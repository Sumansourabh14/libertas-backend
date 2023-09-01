const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `connection made ${conn.connection.host} | Db name: ${conn.connection.db.databaseName}`
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDatabase;
