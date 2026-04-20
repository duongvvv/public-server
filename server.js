const express = require("express");
const mqtt = require("mqtt");
const sql = require("mssql");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MQTT
const client = mqtt.connect("mqtt://broker.hivemq.com");

client.on("connect", () => {
  console.log("MQTT connected");
});

// SQL
const config = {
  user: "sa",
  password: "123456",
  server: "localhost",
  database: "NotificationDB",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// API gửi
app.post("/send", async (req, res) => {
  const { message } = req.body;

  // MQTT
  client.publish("myapp/notify", message);

  // SQL
  try {
    let pool = await sql.connect(config);
    await pool.request()
      .input("message", sql.NVarChar, message)
      .query(`
        INSERT INTO Notifications (Message, CreatedAt)
        VALUES (@message, GETDATE())
      `);
  } catch (err) {
    console.log(err);
  }

  res.json({ success: true });
});

// API lấy
app.get("/messages", async (req, res) => {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .query("SELECT TOP 50 * FROM Notifications ORDER BY CreatedAt DESC");

    res.json(result.recordset);
  } catch {
    res.json([]);
  }
});

app.listen(3000, () => {
  console.log("Server http://localhost:3000");
});