require("dotenv").config();

const amqp = require("amqplib");
const MailSender = require("./MailSender");
const Listener = require("./listener");
const PlaylistService = require("./PlaylistService");

const init = async () => {
  // Memanggil fungsi yang dibutuhkan
  const mailSender = new MailSender();
  const playlistService = new PlaylistService();
  const listener = new Listener(playlistService, mailSender);

  // Membuat koneksi dan channel RabbitMQ
  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  // Membuat antrean serta membuat durable queue
  await channel.assertQueue("export:playlists", {
    durable: true,
  });

  // Untuk mengonsumsi pesan yang ada di dalam antrean export:notes
  channel.consume("export:playlists", listener.listen, { noAck: true });
};

init();
