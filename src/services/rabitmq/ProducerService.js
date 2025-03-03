const ampqlib = require("amqplib");

const ProducerService = {
  sendMessage: async (queue, message) => {
    // membuat koneksi ke rabbitmq server
    const connection = await ampqlib.connect(process.env.RABBITMQ_SERVER);

    // membuat channel
    const channel = await connection.createChannel();

    // membuat queue jika belum ada
    await channel.assertQueue(queue, {
      durable: true,
    });

    // mengirim pesan ke antrian
    await channel.sendToQueue(queue, Buffer.from(message));

    // menutup channel dengan delay 1 detik
    setTimeout(() => {
      connection.close();
    }, 1000);
  },
};

module.exports = ProducerService;
