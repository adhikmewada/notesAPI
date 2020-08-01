var request = require('request');
var objectId = require('mongodb').ObjectID;

const options = {
    hostname: 'localhost',
    port: 80,
    method: 'GET'
};

var paths = {
    register: '/app/user',          //POST:Register option for user
    login: '/app/user/auth',        //POST:Login option for user
    getNotes: '/app/sites/list',    //GET:
    saveNote: '/app/sites'          //POST:
};

const option1 = {
    hostname: 'localhost',
    port: 80,
    // headers: {
    // 	"content-type": "application/json",
    // },
    path: paths.register,
    method: 'POST'
}

var srNoFactor = 1;
var attendenceOne = {
    srNo: srNoFactor,
    time: 'time',
    rollNo: 1,
    class: 'class',
    subject: 'subject',
    lecNo: 1,
    presence: true
};

var attList = [];
let i, j, srNo, count = 0;
srNo = 1;
for (j = 1; j <= 10; j++) {
    for (i = 1; i <= 20; i++) {
        if (i == 3 || i == 10 || i == 15) {
            count++;
            continue;
        }

        var newAtt = JSON.parse(JSON.stringify(attendenceOne));
        newAtt.srNo = srNo++;
        newAtt.time = j + '/12, 10:15AM';
        newAtt.class = '0';
        newAtt.rollNo = i;
        newAtt.lecNo = j;
        attList.push(newAtt);
    }

    for (i = 1; i <= 20; i++) {
        if (i == 3 || i == 10 || i == 15)
            continue;

        var newAtt = JSON.parse(JSON.stringify(attendenceOne));
        newAtt.srNo = srNo++;
        newAtt.time = j + '/12, 12:15PM';
        newAtt.class = '1';
        newAtt.rollNo = i + 20;
        newAtt.lecNo = j;
        attList.push(newAtt);
    }

    for (i = 1; i <= 20; i++) {
        if (i == 3 || i == 10 || i == 15)
            continue;

        var newAtt = JSON.parse(JSON.stringify(attendenceOne));
        newAtt.srNo = srNo++;
        newAtt.time = j + '/12, 2:15PM';
        newAtt.class = '2';
        newAtt.rollNo = i + 40;
        newAtt.lecNo = j;
        attList.push(newAtt);
    }
}

// var configList = [{
//         rollNo: []
//     },
//     {
//         rollNo: []
//     },
//     {
//         rollNo: []
//     }
// ];

// let i, j;
// for (j = 0; j < 3; j++) {
//     for (i = 1; i <= 20; i++) {
//         configList[j].rollNo.push(i + 20 * j);
//     }
// }

var addBody = {
    command: 'addAttendence',
    // configList: configList
    // query 			: {},
    attendenceList: attList
};

console.log('count ' + count);
console.log('srNo ' + srNo);
console.log(attList.length);

request('http://localhost:3000/apiLogin', { method: 'POST', 'json': true, 'body': loginAdminReq, jar: cookieJar }, (error, res1, body) => {
    console.log('statusCode:' + res1.statusCode);

    res1.on('data', d => {
        console.log(d);
    });

    request('http://localhost:3000/apiFaculty', { method: 'POST', 'json': true, 'body': addBody, jar: cookieJar }, (error, res2, body) => {
        console.log('statusCode: ' + res2.statusCode);
        // var json1 = JSON.parse(res2.body);
        console.log(res2.body);

        res2.on('data', d => {
            console.log(d);
        });
    });

    // request('http://localhost:3000/apiAdmin', { method: 'POST', 'json': true, 'body': addBody, jar: cookieJar }, (error, res2, body) => {
    //     console.log('statusCode:' + res2.statusCode);

    //     res2.on('data', d => {
    //         console.log(d);
    //     });
    // });

});

console.log('Test started');