var mysql = require('mysql');

var dbCollections = {
	users : 'users',
	notes : 'notes'
};

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin"
});

var dbName = "notesManager"

con.connect(function(err) {
  if (err) throw err;
  console.log("DB Connected!");

  var sql = "USE " + dbName + ";";

  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("table opened");
  });
});

exports.init = function()
{
	return con;
}