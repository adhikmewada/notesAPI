var Express = require('express');
var BodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
// var Cors = require('cors');
var Utils = require('./utils');
var Encryption = require('./encryption');
// var session = require('express-session');


//constants
var paths = {
    register: '/app/user', 			//POST:Register option for user
    login: '/app/user/auth', 		//POST:Login option for user
    getNotes: '/app/sites/list', 	//GET:
    saveNote: '/app/sites'			//POST:
};

var dbCollections = {
	users : 'users',
	notes : 'notes'
};

var responses = {
    ok: 200,
    notOk: 400
};

var ids = {
	register : "Register",
	login : "Login",
	getNotes : "Get notes",
	saveNote : "Save note"
}

// Globals
var dbName = 'notesManager';
var mongoUrl = 'mongodb://127.0.0.1:27017/' + dbName;
var serverId = 'SERVER';
var encryption_key = '';
var dbMain;
var activeUsers = {};
var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));

MongoClient.connect(mongoUrl, { useUnifiedTopology: true }, function(err, db) {
    Utils.assertError(err, serverId, 'connecting to mongodb at address: ' + mongoUrl);

    dbMain = db.db(dbName)
    Utils.log(serverId, 'Database connected');

    // dbMain.createCollection(dbCollections.users, function(err, res) {
    //     Utils.assertError(err, serverId, 'creating users collection')
    //     Utils.log(serverId, 'Users collection checked');
    // });
    // dbMain.createCollection(dbCollections.notes, function(err, res) {
    //     Utils.assertError(err, serverId, 'creating notes collection')
    //     Utils.log(serverId, 'Notes collection checked');
    // });
});

app.post(paths.register, function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

	Utils.log(ids.register, 'Invoked by username:' + username);    

    var query = {
    	username : username
    };

    var data = [
	    {
	  		username : username,
	  		password : Encryption.encrypt(password)
	    }
    ];

    
    dbMain.collection(dbCollections.users).findOne(query, function(err, result) {
        Utils.assertError(err, ids.register, 'finding user at register path');

        if (!err && !result) {
			dbMain.collection(dbCollections.users).insertMany(data, function(err, resultInsert) {
                Utils.assertError(err, ids.register, 'registering user');

                if (!err && resultInsert.result.n > 0) {
                    Utils.log(username, 'Account created');
		            res.status(responses.ok).json({ 
		            	status : "account created"
		            });
                } else {
		            Utils.log(username, 'Register failed');
		            res.status(responses.notOk).json({ 
		            	status : "account registration failed"
		            });
                }
            });            
        } else {
            Utils.log(username, 'username exists');
            res.status(responses.notOk).json({ 
            	status : "username exists"
            });
        }
    });	

});


app.post(paths.login, function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var id;

	Utils.log(ids.login, 'Invoked by username:' + username);    

    var query = {
    	username : username
    };

    if(activeUsers.hasOwnProperty(username))
    {
    	Utils.log(username, 'User already logged in');
        res.status(responses.ok).json({ 
        	status : "success",
        	userId : activeUsers[username]
        });
    	return;
    }


	dbMain.collection(dbCollections.users).findOne(query, function(err, result) {
        Utils.assertError(err, ids.login, 'finding user at login path');


	  	if (!err && result && Encryption.decrypt(result.password) === password) {
            id = Utils.getUserId();
            activeUsers[username] = id;

            Utils.log(username, 'login success');
            res.status(responses.ok).json({ 
            	status : "success",
            	userId : id
            });
        } else {
            Utils.log(username, 'Invalid details');
            res.status(responses.notOk).json({ 
            	status : "Invalid account details"
            });
        }
    });	

});

app.get(paths.getNotes, function(req, res) {
    var id = req.query.user;
    var found = false;
    var username;
    var query;

	Utils.log(ids.getNotes, 'Invoked by userId:' + id);    

    for(var user in activeUsers)
    {
    	if(activeUsers.hasOwnProperty(user))
    	{
    		if(activeUsers[user] == id)
    		{
    			username = user;
    			found = true;
    			break;
    		}
    	}
    }


    if( !found )
    {
    	Utils.log(id, 'User needs to login');
        res.status(responses.notOk).json({ 
        	status : "User needs to login"
        });
    	return;
    }

    query = {
    	username : username
    };

	dbMain.collection(dbCollections.notes).find(query).toArray(function(err, result) {
        var notes = [];

        Utils.assertError(err, ids.getNotes, 'finding user in notes');

	  	if (!err && result) {
            id = Utils.getUserId();
            activeUsers[username] = id;

            Utils.log(username, 'GET notes success');
            // console.log(result);

            for(note in result)
            {
            	if(result.hasOwnProperty(note))
            	{
            		notes.push( Encryption.decrypt(result[note].note) );
            	}
            }

            res.status(responses.ok).json(notes);
        } else {
            Utils.log(username, 'Unable to find notes');
            res.status(responses.notOk).json({ 
            	status : "Unable to find notes"
            });
        }
    });	

});

app.post(paths.saveNote, function(req, res) {
    var id = req.query.user;
    var note = req.body.note;
    var found = false;
    var username;
    var data;

	Utils.log(ids.saveNote, 'Invoked by userId:' + id);    

    for(var user in activeUsers)
    {
    	if(activeUsers.hasOwnProperty(user))
    	{
    		if(activeUsers[user] == id)
    		{
    			username = user;
    			found = true;
    			break;
    		}
    	}
    }


    if( !found )
    {
    	Utils.log(id, 'User needs to login');
        res.status(responses.notOk).json({ 
        	status : "User needs to login"
        });
    	return;
    }

    data = {
    	username : username,
    	note : Encryption.encrypt(note)
    };

	dbMain.collection(dbCollections.notes).insertOne(data, function(err) {
        Utils.assertError(err, ids.saveNote, 'inserting note');

	  	if (!err) {
	  		Utils.log(username, 'Save note success');
            res.status(responses.ok).json({
            	status : "success"
            });
        } else {
            Utils.log(username, 'Unable to save note');
            res.status(responses.notOk).json({ 
            	status : "Unable to save note"
            });
        }
    });	

});

app.use(Express.static('public'));

//Listen for requests on this port
app.listen(80, () => {
    Utils.log(serverId, 'server is running on localhost:80');
});
