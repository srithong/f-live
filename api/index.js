const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

function start() {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cors());

  let clients = [];
  let comments = [];

  app.get("/api/live", (req, res) => {
    const name = req.query.name;
    if (!name) return res.status(400).send("name is required");
    const headers = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    };
    res.writeHead(200, headers);
    const id = uuidv4();
    clients = [...clients, { res, id }];
    comments = [
      ...comments,
      {
        name: "",
        message: `${name} joined the live stream`,
        date: new Date(),
      },
    ];
    clients.forEach((client) => {
      const eventName = `event: live\n`;
      const data = `data: ${JSON.stringify(comments)}\n\n`;
      client.res.write(eventName);
      client.res.write(data);
    });
    req.on("close", () => {
      clients = clients.filter((client) => client.id !== id);
      console.log("lost connection");
    });
  });

  app.post("/api/comments", (req, res) => {
    const { name, message } = req.body;
    if (!name || !message)
      return res.status(400).send("name and message are required");
    var randomColor = Math.floor(Math.random() * 16777215).toString(16);
    comments = [
      ...comments,
      {
        name: name,
        color: "#" + randomColor,
        message: message,
        date: new Date(),
      },
    ];
    clients.forEach((client) => {
      const eventName = `event: live\n`;
      const data = `data: ${JSON.stringify(comments)}\n\n`;
      client.res.write(eventName);
      client.res.write(data);
    });
    res.sendStatus(200);
  });

  setInterval(() => {
    comments = [];
  }, 600000);
  app.listen(3000, () => console.log("Example app listening on port 3000!"));
}

start();
