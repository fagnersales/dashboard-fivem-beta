// Requerindo o mysql lib
var mysql = require('mysql');

// Requerindo a lib do express e o express-session
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

// Requerindo o path nativo
var path = require('path');

// Requerindo o arquivo de configuração 
var config = require("./config.json")

// Criando a conexão com o banco de dados
var connection = mysql.createConnection({
	host     : config.host,
	user     : config.user,
	password : config.password ? config.password : "",
	database : config.database
});

// Criando o APP do servidor
var app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(express.static('views'));
app.use(express.static(path.join(__dirname, "/public")))

app.engine("html", require("ejs").renderFile)
app.set("view engine", "ejs")
app.set('views', __dirname + '/views')

// Criando a Rota "/"
app.get('/', function(request, response) {
	response.render("form.ejs")
});

// Criando a rota "/fazendowl"
app.post('/fazendowl', function(request, response) {
	var id = request.body.id;
	var nome = request.body.nome;
	var sobrenome = request.body.sobrenome;
	var idadenarnia = request.body.idade;
	var metagmg = request.body.metagmg;
	var powergmg = request.body.powergmg;
	var darkrp = request.body.darkrp;
	var historiaperso = request.body.historiaperso;
	if (id && nome && sobrenome && idadenarnia && metagmg && powergmg && darkrp && historiaperso) {
		connection.query(`INSERT INTO web_person_questions (id,nome,sobrenome,idade,metagmg,powergmg,darkrp,historiaperso) VALUES (?,?,?,?,?,?,?,?)`, [id,nome,sobrenome,idadenarnia,metagmg,powergmg,darkrp,historiaperso], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				response.redirect('/dashboard');
			} else {
				response.send(`Sua Whistelist foi para aprovação!`)
			}			
			response.end();
		});
	} else {
		response.send('Coloque as informações!');
		response.end();
	}
});



// Criando a Rota "/login"
app.get('/login', function(request, response) {
	response.render("login.ejs")
});

// Criando a rota "/auth"
app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM web_accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/dashboard');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});



// Criando a rota "/wl"
app.post('/wl', function(request, response) {
	var id = request.body.id;
	if (id) {
		connection.query(`UPDATE vrp_users SET whitelisted = '1' WHERE id = ?`, [id], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				response.redirect('/dashboard');
			} else {
				response.redirect('/sucess');
			}			
			response.end();
		});
	} else {
		response.send('Coloque o ID!');
		response.end();
	}
});

app.post('/unwl', function(request, response) {
	var id = request.body.id;
	if (id) {
		connection.query(`UPDATE vrp_users SET whitelisted = '0' WHERE id = ?`, [id], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				response.redirect('/dashboard');
			} else {
				response.redirect('/sucess');
			}			
			response.end();
		});
	} else {
		response.send('Coloque o ID!');
		response.end();
	}
});

app.post('/banir', function(request, response) {
	var id = request.body.id;
	if (id) {
		connection.query(`UPDATE vrp_users SET banned = '1' WHERE id = ?`, [id], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				response.redirect('/dashboard');
			} else {
				response.redirect('/sucess');
			}			
			response.end();
		});
	} else {
		response.send('Coloque o ID!');
		response.end();
	}
});

app.post('/unbanir', function(request, response) {
	var id = request.body.id;
	if (id) {
		connection.query(`UPDATE vrp_users SET banned = '0' WHERE id = ?`, [id], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				response.redirect('/dashboard');
			} else {
				response.redirect('/sucess');
			}			
			response.end();
		});
	} else {
		response.send('Coloque o ID!');
		response.end();
	}
});

app.post('/criaruser', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('INSERT INTO web_accounts (username, password) VALUES (?, ?)', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				response.redirect('/dashboard');
			} else {
				response.redirect('/sucess');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/remuser', function(request, response) {
	var username = request.body.username;
	if (username) {
		connection.query(`DELETE FROM web_accounts WHERE username = ?`, [username]);
				request.session.loggedin = true;
				response.redirect('/sucess');		
				response.end();
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

// Criando a rota "/dashboard"
app.get('/dashboard', function(request, response) {
	if (request.session.loggedin) {
		response.render("dashboard.ejs", {
			totalwl: 3,
			totalbanned: 1,
			totaluser: 3
		})

	} else {
		response.send('Clique <a href="/login">aqui</a> para fazer o login!');
	}
	response.end();
});

app.get('/sucess', function(request, response) {
	response.render("sucess.ejs")
})

app.listen(process.env.PORT || 3000);