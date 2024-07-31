const mariadb = require('mariadb/callback');
const conn = mariadb.createConnection({
      host: '127.0.0.1', 
      user:'vladimir',
      password: '123456',
      database:'DB1',
    });
conn.connect(err => {
  if (err) {
    console.log("No Connect: " + err);
  } else {
    console.log("Connect ! connection identifier: " + conn.threadId);
  }
});
conn.query("SELECT * FROM user;", (err, rows, meta) => {
    if (err) throw err;
    console.log(rows); //[ { { 'now()': 2018-07-02T17:06:38.000Z } ]
    conn.end(err => {
        // обработка ошибки
        if (err) console.log('error end connect: ' + err);
        else console.log('connect END!!! ');
    });
});
/*conn.end(err => {
    // обработка ошибки
    if (err) console.log('error end connect: ' + err);
    else console.log('connect END!!! ');
});*/