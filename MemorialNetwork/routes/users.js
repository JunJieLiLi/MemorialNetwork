var express = require('express');
var router = express.Router();
var sendgridHelper = require("sendgrid").mail;
var sendgrid = require("sendgrid")('SG.2RruK1wESJSkRIoV0kEcPw.tIR4UO0DRIgGc9YRykvzOy9r-YEvkuRlyFZghPqE0aU');

/* GET users listing. */
router.get('/', function(req, res, next) {
	var collection = req.db.get("test");
	console.log("here " + collection)
    collection.find({},{},function(e,docs){
        res.send(docs);
    });
});

//Display registration complete page
router.get('/complete', function(req, res, next){
	res.render('registration_complete');
});

//Display register page
router.get('/register', function(req, res, next){
	res.render('register', { title: "Register"});
});

//Display register page
router.get('/login', function(req, res, next){
	res.render('login', { title: "Login"});
});

//process register post
router.post('/register', function(req, res, next){
	var users = req.db.get('users');
	//Check parameters are filled and passwords match
	if(req.body.email.length == 0 || req.body.password.length<6 || req.body.password != req.body.password2){
		res.render('register', { title: "Register"});
	}else{
		//check if email is unique
		users.findOne({email: req.body.email}).then((doc) => {
			if(doc == null){
				console.log(doc);

				//create new user
				users.insert({email: req.body.email, password: req.body.password, activated: false});

				var from_email = new sendgridHelper.Email("no-reply@memorialnetwork.com");
				var to_email = new sendgridHelper.Email(req.body.email);
				var subject = 'Memorial Network Registration';
				var content = new sendgridHelper.Content('text/plain', 'Thank you for registering with Memorial Network!');
				var mail = new sendgridHelper.Mail(from_email, subject, to_email, content);

				var request = sendgrid.emptyRequest({
						method: 'POST', 
						path: '/v3/mail/send', 
						body: mail.toJSON(), 
					});

				sendgrid.API(request, function(error, response){
					console.log(response.statusCode);
					console.log(response.body);
			 		console.log(response.headers);
				});

				//redirect to signup complete page.
				res.redirect('complete');
			} else{
				res.redirect('register');
			}
		});
	}
});

module.exports = router;
