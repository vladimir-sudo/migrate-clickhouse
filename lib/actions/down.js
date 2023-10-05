const _ = require("lodash");
const { promisify } = require("util");
const fnArgs = require('fn-args');

const status = require("./status");
const config = require("../env/config");
const migrationsDir = require("../env/migrationsDir");
const hasCallback = require('../utils/has-callback');

module.exports = async (client) => {
  const downgraded = [];
  const statusItems = await status(client);
  const appliedItems = statusItems.filter(item => item.appliedAt !== "PENDING");
  const lastAppliedItem = _.last(appliedItems);

  if (lastAppliedItem) {
    try {
      const migration = await migrationsDir.loadMigration(lastAppliedItem.fileName);
      const down = hasCallback(migration.down) ? promisify(migration.down) : migration.down;

      if (hasCallback(migration.down) && fnArgs(migration.down).length < 3) {
        await down(client);
      } else {
        await down(client);
      }

    } catch (err) {
      throw new Error(
        `Could not migrate down ${lastAppliedItem.fileName}: ${err.message}`
      );
    }
    const { migrationsTableName } = await config.read();

    try {

      const insertMigrations = statusItems.filter((migration) => {
        if (migration.appliedAt === 'PENDING') return false;

        return lastAppliedItem.fileName !== migration.fileName;
      })

      await client.query(`TRUNCATE ${migrationsTableName};`).toPromise();
      await client.insert(`INSERT INTO ${migrationsTableName} (fileName, fileHash, appliedAt)`, insertMigrations).toPromise();

      downgraded.push(lastAppliedItem.fileName);
    } catch (err) {
      throw new Error(`Could not update changelog: ${err.message}`);
    }
  }

  return downgraded;
};
