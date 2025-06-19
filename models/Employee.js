const db = require("../config/database");

class Employee {
  static async create(employeeData) {
    const { user_id, usaha_id } = employeeData;
    const [result] = await db.execute(
      `INSERT INTO employees (user_id, usaha_id) VALUES (?, ?)`,
      [user_id, usaha_id]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT e.*, u.username, u.email, us.nama_usaha 
       FROM employees e 
       JOIN users u ON e.user_id = u.id 
       LEFT JOIN usaha us ON e.usaha_id = us.id
       WHERE e.user_id = ?`,
      [userId]
    );
    return rows[0];
  }

  static async findAll() {
    const [rows] = await db.execute(
      `SELECT e.*, u.username, u.email, us.nama_usaha 
       FROM employees e 
       JOIN users u ON e.user_id = u.id
       LEFT JOIN usaha us ON e.usaha_id = us.id`
    );
    return rows;
  }

  static async update(userId, employeeData) {
    const { usaha_id } = employeeData;
    const [result] = await db.execute(
      `UPDATE employees 
       SET usaha_id = ?
       WHERE user_id = ?`,
      [usaha_id, userId]
    );
    return result.affectedRows > 0;
  }

  static async deleteByUserId(userId) {
    await db.execute("DELETE FROM employees WHERE user_id = ?", [userId]);
  }
}

module.exports = Employee;
