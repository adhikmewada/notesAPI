var paths = {
    register: '/app/user', 			//POST:Register option for user
    login: '/app/user/auth', 		//POST:Login option for user
    getNotes: '/app/sites/list', 	//GET:
    saveNote: '/app/sites'			//POST:
};

// $.ajax({
//     url: paths.register,
//     data: JSON.stringify({ username : "user3", password : "password"}),
//     dataType: 'json',
//     type: 'POST',
//     contentType: 'application/json',
//     success: response => console.log(response),
//     error: e => console.log(e)
// });


var user = {
	username : "user3",
	password : "password"
}


$.ajax({
    url: paths.login,
    data: JSON.stringify(user),
    dataType: 'json',
    type: 'POST',
    contentType: 'application/json',
    success: response1 => {
    	console.log(response1);
    	$.ajax({
		    url: paths.saveNote + "?user=" + response1.userId,
			data: JSON.stringify({
				note : "Its my note"
			}),
			contentType: 'application/json',
		    dataType: 'json',
		    type: 'POST',
		    success: response => {
		    	console.log(response)
		    	$.ajax({
				    url: paths.getNotes + "?user=" + response1.userId,
				    dataType: 'json',
				    type: 'GET',
				    success: response => console.log(response),
				    error: e => console.log(e)
				});	
		    },
		    error: e => console.log(e)
		});
	},
    error: e => console.log(e)
});

// $.ajax({
//     url: paths.login,
//     data: JSON.stringify(user),
//     dataType: 'json',
//     type: 'POST',
//     contentType: 'application/json',
//     success: response => {
//     	$.ajax({
// 		    url: paths.getNotes + "?user=" + response.userId,
// 		    dataType: 'json',
// 		    type: 'GET',
// 		    success: response => console.log(response),
// 		    error: e => console.log(e)
// 		});
// 	},
//     error: e => console.log(e)
// });