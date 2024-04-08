const {
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");

const makeWASocket = require("@whiskeysockets/baileys").default;

async function connectionLogic() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const sock = makeWASocket({
    // can provide additional config here
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update || {};

    if (qr) {
      console.log("qr: ", qr);
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log(
        "connection closed due to ",
        lastDisconnect.error,
        ", reconnecting ",
        shouldReconnect
      );

      // reconnect if not logged out
      if (shouldReconnect) {
        connectionLogic();
      }
    }
  });
  sock.ev.on("messages.update", (messageInfo) => {
    console.log("messageInfo: ", messageInfo);
  });
  sock.ev.on("messages.upsert", (messageInfoUpsert) => {
    console.log("messageInfoUpsert: ", messageInfoUpsert);
  });
  sock.ev.on("cards.update", saveCreds);
}

connectionLogic();
