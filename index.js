const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

var id_respondent;
var maxQuestion;
var numQuestion;
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'audiolab'
});
connection.connect();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


http.listen(3000, () => {
    console.log('listening on *:3000');
});



io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('answer', (msg) => {
        console.log('answer: ' + msg);
        connection.query("INSERT INTO `odpovede` (`id_otazka`, `id_respondent`, `odpoved`, `id_odpoved`) VALUES ('"+(numQuestion-1)+"','"+id_respondent+"', '"+msg+"', NULL);", function (error, results, fields) {
            if (error)
                throw error;
            console.log("zapisane: " + (numQuestion - 1) + ' ' + id_respondent + ' ' + msg);
        });

        if (numQuestion > maxQuestion) {
            socket.emit('stopTest','');
        } else {
            connection.query(`SELECT * from otazky WHERE id_otazka = ${numQuestion};`, function (error, results, fields) {
                if (error)
                    throw error;
                console.log(results[0].otazka);
                socket.emit('questionOut', results[0].otazka);
                numQuestion = numQuestion + 1;
            });
        }
    });
    socket.on('question', (msg) => {
        console.log('question ' + msg);
        numQuestion = msg;
        id_respondent = Math.floor(Math.random() * 100);
        connection.query(`SELECT * from otazky;`, function (error, results, fields) {
            if (error)
                throw error;
            maxQuestion = results.length;
        });
        connection.query(`SELECT * from otazky WHERE id_otazka = ${numQuestion};`, function (error, results, fields) {
            if (error)
                throw error;
            console.log(results[0].otazka);
            socket.emit('questionOut', results[0].otazka);
            numQuestion++;
        });
    }
    );
});
/* const app = require('express')();
 const http = require('http').createServer(app);
 const io = require('socket.io')(http);
 
 var mysql      = require('mysql');
 var connection = mysql.createConnection({
 host     : 'localhost',
 user     : 'root',
 password : '',
 database : 'audiolab'
 });
 connection.connect();
 
 
 http.listen(3000, () => {
 console.log('listening on *:3000');
 });
 
 app.get('/', (req, res) => {
 res.sendFile(__dirname + '/index.html');
 });
 
 io.on('connection', (socket) => {
 console.log('connected');
 socket.on('chat message', (msg) => {
 console.log('message: ' + msg);
 });
 });
 
 
 app.get('/', (req, res) => { 
 connection.query('SELECT * from otazky ;', function (error, results, fields) {
 if (error) throw error;
 console.log(results);
 }); 
 });
 */