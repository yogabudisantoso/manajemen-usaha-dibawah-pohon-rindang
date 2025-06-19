const db = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  static async findByEmail(email) {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async create(userData) {
    const { username, email, password, role_id, usaha_id } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (username, email, password, role_id, usaha_id) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, role_id, usaha_id]
    );

    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT u.*, us.nama_usaha 
       FROM users u 
       LEFT JOIN usaha us ON u.usaha_id = us.id
       WHERE u.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findAllEmployees() {
    const [rows] = await db.execute(
      `SELECT u.id, u.username, u.email, us.nama_usaha AS usaha
       FROM users u 
       LEFT JOIN usaha us ON u.usaha_id = us.id
       WHERE u.role_id = 2`
    );
    return rows;
  }

  static async update(id, userData) {
    const { username, email, password, usaha_id } = userData;
    let query = "UPDATE users SET ";
    const values = [];
    const updates = [];

    if (username) {
      updates.push("username = ?");
      values.push(username);
    }

    if (email) {
      updates.push("email = ?");
      values.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      values.push(hashedPassword);
    }

    if (usaha_id !== undefined) {
      updates.push("usaha_id = ?");
      values.push(usaha_id);
    }

    if (updates.length === 0) {
      return false;
    }

    query += updates.join(", ") + " WHERE id = ?";
    values.push(id);

    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}

module.exports = User;
