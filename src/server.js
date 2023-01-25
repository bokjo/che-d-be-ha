const app = require("./app");
const { logger } = require("./logger");

async function init() {
  try {
    app.listen(3001, () => {
      logger.info("Express App Listening on: http://localhost:3001");
    });
  } catch (error) {
    logger.error(`An error occurred: ${JSON.stringify(error)}`);
    process.exit(1);
  }
}

init();
