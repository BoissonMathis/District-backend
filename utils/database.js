const mongoose = require("mongoose");
const Logger = require("./logger").pino;
const Config = require("../config");

mongoose.connection.on("connected", () =>
  Logger.info("Connecté à la base de donnée.")
);
mongoose.connection.on("open", () =>
  Logger.info("Connection ouverte à la base de donnée.")
);
mongoose.connection.on("disconnected", () =>
  Logger.error("Déconnecter a la base de donnée.")
);
mongoose.connection.on("reconnected", () =>
  Logger.info("Reconnecté à la base de donnée.")
);
mongoose.connection.on("disconnecting", () =>
  Logger.error("Déconnection à la base de donnée.")
);
mongoose.connection.on("close", () =>
  Logger.info("Connection à la base de donnée fermé.")
);

mongoose.connect(
  `${Config.url_database}/${
    process.env.npm_lifecycle_event == "test"
      ? "CDA_SERVER_TEST"
      : "CDA_SERVER_PROD"
  }`,
  {
    useUnifiedTopology: true,
  }
);
