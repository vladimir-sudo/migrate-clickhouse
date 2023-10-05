const { find } = require("lodash");
const migrationsDir = require("../env/migrationsDir");
const config = require("../env/config");

module.exports = async client => {
  await migrationsDir.shouldExist();
  await config.shouldExist();
  const fileNames = await migrationsDir.getFileNames();

  const { changelogCollectionName, useFileHash } = await config.read();

  const [result] = await client.query(`EXISTS TABLE ${client.opts.database}.${changelogCollectionName};`).toPromise();

  if (result.result === 0) {
    const createMigrationsTableQuery = `
        CREATE TABLE ${changelogCollectionName} (
            appliedAt DateTime,
            fileName String,
            fileHash String
        )
        ENGINE = MergeTree
        ORDER BY fileName;
    `;

    await client.query(createMigrationsTableQuery).toPromise();
  }

  const changelog = await client.query(`SELECT * from ${changelogCollectionName}`).toPromise();

  const useFileHashTest = useFileHash === true;
  const statusTable = await Promise.all(fileNames.map(async (fileName) => {
    let fileHash;
    let findTest = { fileName };
    if (useFileHashTest) {
      fileHash = await migrationsDir.loadFileHash(fileName);
      findTest = { fileName, fileHash };
    }
    const itemInLog = find(changelog, findTest);
    const appliedAt = itemInLog ? itemInLog.appliedAt : "PENDING";
    return useFileHash ? { fileName, fileHash, appliedAt } : { fileName, appliedAt };
  }));

  return statusTable;
};
