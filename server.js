const express = require("express");
const cors = require("cors");
const mqtt = require("mqtt");

const app = express();
app.use(cors());
app.use(express.json());

const client = mqtt.connect("mqtt://test.mosquitto.org");

client.on("connect", () => {
  console.log("MQTT connected");
});

app.get("/", (req, res) => {
  res.send("Server OK");
});

app.post("/send", (req, res) => {
  const { message } = req.body;
  client.publish("myapp/notify", message);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});