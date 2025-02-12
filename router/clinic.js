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
  
  let sensorData = []; // เก็บข้อมูลทั้งหมดจากฐานข้อมูล
  let currentIndex = 0; // เก็บตำแหน่งปัจจุบันของข้อมูลที่จะแสดง

// โหลดข้อมูลเซ็นเซอร์ทั้งหมดจากฐานข้อมูล
const loadSensorData = () => {
    db.query("SELECT * FROM sensors ORDER BY Timestamp ASC", (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return;
        }
        if (results.length > 0) {
            sensorData = results;
            currentIndex = 0;
            console.log("Loaded sensor data:", sensorData.length, "rows");
        }
    });
};

// โหลดข้อมูลทันทีที่เซิร์ฟเวอร์เริ่มทำงาน
loadSensorData();

// API ดึงข้อมูลเซ็นเซอร์ตามลำดับ (แถวแรกไปแถวสุดท้าย)
router.get('/sensor/realtime', (req, res) => { 
    if (sensorData.length === 0) {
        return res.status(404).json({ success: false, message: "No sensor data available" });
    }

    // ดึงข้อมูลแถวปัจจุบัน
    const data = sensorData[currentIndex];

    // แปลง Timestamp เป็นวัน/เดือน/ปี เวลา
    let timestamp = new Date(data.Timestamp);
    let formattedDate = timestamp.toLocaleDateString("en-GB"); // DD/MM/YYYY
    let formattedTime = timestamp.toLocaleTimeString("en-GB"); // HH:mm:ss
    data.Timestamp = `${formattedDate} ${formattedTime}`;

    // ไปแถวถัดไป หรือวนกลับไปที่แถวแรกหากถึงแถวสุดท้าย
    currentIndex = (currentIndex + 1) % sensorData.length;

    res.json({ success: true, data });
});

    router.get("/plants", (req, res) => {
      db.query("SELECT plants.PlantID, subplantname.PlantName, subplantseason.PlantSeason, subgrowth.GrowthStage, plants.CropDensity, plants.PestPressure FROM plants JOIN subplantname ON plants.PlantName = subplantname.PlantID2 JOIN subgrowth ON plants.GrowthStage = subgrowth.PlantID3 JOIN subplantseason ON plants.PlantSeason = subplantseason.PlantID11 ORDER BY plants.PlantID;", (err, result) => {
          if (err) throw err;
          res.json(result);
      });
    });

    router.get("/plantname", (req, res) => {
      db.query("SELECT * FROM subplantname ORDER BY PlantID2;", (err, result) => {
          if (err) throw err;
          res.json(result);
      });
    });

    router.post("/add-plantname", (req, res) => {
      const { PlantName } = req.body;
      db.query("INSERT INTO subplantname (PlantName) VALUES (?);", [PlantName], (err, result) => {
        if (err) {
          res.json({ success: false, error: err.message });
        } else {
          res.json({ success: true, result });
        }
      });
    });

  return router; // Return the router instance
};
