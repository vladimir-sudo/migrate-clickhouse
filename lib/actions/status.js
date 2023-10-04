const { find } = require("lodash");
const migrationsDir = require("../env/migrationsDir");
const config = require("../env/config");

module.exports = async client => {
  await client;

  console.log(client);
  await migrationsDir.shouldExist();
  await config.shouldExist();
  const fileNames = await migrationsDir.getFileNames();

  const { changelogCollectionName, useFileHash } = await config.read();

  const query = `
      SELECT * from ${changelogCollectionName}
  `;

  const changelog = client.query(query);

  const useFileHashTest = useFileHash === true;
  const statusTable = await Promise.all(fileNames.map(async (fileName) => {
    let fileHash;
    let findTest = { fileName };
    if (useFileHashTest) {
      fileHash = await migrationsDir.loadFileHash(fileName);
      findTest = { fileName, fileHash };
    }
    const itemInLog = find(changelog, findTest);
    const appliedAt = itemInLog ? itemInLog.appliedAt.toJSON() : "PENDING";
    return useFileHash ? { fileName, fileHash, appliedAt } : { fileName, appliedAt };
  }));

  return statusTable;
};
