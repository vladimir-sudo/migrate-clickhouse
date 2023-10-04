module.exports = {
  async up(client) {
    // TODO write your migration here.
    // See https://github.com/vladimir-sudo/migrate-clickhouse/#creating-a-new-migration-script

    // const query = `CREATE TABLE session_temp (
    //                           date Date,
    //                           time DateTime,
    //                           mark String,
    //                           ips Array(UInt32),
    //                           queries Nested (
    //                               act String,
    //                               id UInt32
    //                           )
    //                       )
    //                       ENGINE=MergeTree(date, (mark, time), 8192)`;
    //
    // await client.query(query).toPromise();
  },

  async down(client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // const query = `DROP TABLE IF EXISTS session_temp`;
    //
    // await client.query(query).toPromise();
  }
};
