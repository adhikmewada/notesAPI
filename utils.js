var sessionCount = 1;

exports.getUserId = function(session)
{
	return sessionCount++;
}

exports.assertError = function(err, userId, des)
{
	if(err)
	{
		exports.log(userId, 'Error while ' + des);
		console.error(err);
	}
}

exports.log = function(userId, logBody)
{
	console.log(userId + ": " + logBody);
}