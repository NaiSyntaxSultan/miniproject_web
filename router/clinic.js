const express = require('express');
const router = express.Router();

// Define your routes
router.get('/', (req, res) => {
  res.send('Welcome to the GreenSync!');
});

// Export a function that accepts the db connection
module.exports = (db) => {
  // APIs
  router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required" });
    }

    //  ตรวจสอบ username และ password ในฐานข้อมูล
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length > 0) {
            res.json({ success: true, message: "Login successful" });
        } else {
            res.json({ success: false, message: "Invalid username or password" });
        }
    });
  });


  router.post('/register', (req, res) => {
    console.log("Request Body:", req.body);
    const { username, password, email } = req.body;
    db.query('INSERT INTO users (Username, Password, Email) VALUES (?, ?, ?)',[username, password, email], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error saving the user');
        return;
      }
      res.json({ success: true, message: 'User saved successfully' });
    });
  });
  
  return router; // Return the router instance
};
