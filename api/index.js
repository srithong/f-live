const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

function start() {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cors());

  let monitors = [];
  let clients = [];
  let messages = [];

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
    monitors = [...monitors, { res, id }];
    messages = [
      ...messages,
      {
        name: "System",
        message: `${name} joined the live stream`,
        date: new Date(),
      },
    ];
    monitors.forEach((client) => {
      const eventName = `event: live\n`;
      const data = `data: ${JSON.stringify(messages)}\n\n`;
      client.res.write(eventName);
      client.res.write(data);
    });
    req.on("close", () => {
      monitors = monitors.filter((client) => client.id !== id);
      console.log("lost connection");
    });
  });

  app.post("/api/messages", (req, res) => {
    const { uuid, message } = req.body;
    if (!uuid || !message)
      return res.status(400).send("uuid and message are required");
    const client = clients.find((client) => client.uuid === uuid);
    if (!client) return res.status(400).send("invalid uuid");

    messages = [
      ...messages,
      {
        name: client.name,
        uuid: uuid,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
        message: message,
        date: new Date(),
      },
    ];

    monitors.forEach((client) => {
      const eventName = `event: live\n`;
      const data = `data: ${JSON.stringify(messages)}\n\n`;
      client.res.write(eventName);
      client.res.write(data);
    });
    res.sendStatus(200);
  });

  app.get("/api/messages", (req, res) => {
    res.status(200).send(messages);
  });

  app.post("/api/register", (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).send("name is required");
    const uuid = uuidv4();
    clients = [...clients, { name, uuid }];
    res.status(200).send({
      uuid,
    });
  });

  setInterval(() => {
    messages = [];
  }, 300000);

  app.listen(3000, () => console.log("Example app listening on port 3000!"));
}

start();
