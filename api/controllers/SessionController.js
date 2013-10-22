/**
 * SessionController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */
var bcrypt = require('bcrypt');

module.exports = {

	new : function (req, res) {
		res.view('session/new');
	},

	create: function(req, res, next) {
		
		if (!req.param('email') || !req.param('password')) {
			
			var usernamePasswordRequiredError = [{name: 'usernamePasswordRequired', message: 'You must enter both a username and password'}]
			
			req.session.flash = {
				err: usernamePasswordRequiredError
			}

			res.redirect('/session/new');

			return;

		}

		User.findOneByEmail(req.param('email')).done(function(err, user) {
			
			if (err) return next(err);

			if(!user) {
				var noAccountError = [{name: 'noAccount', message: 'The email address ' + req.param('email') + ' not found.'}]
				req.session.flash = {
					err:noAccountError
				}
				res.redirect('/session/new')
				return;
			}

			bcrypt.compare(req.param('password'), user.encryptedPassword, function(err, valid) {
				if (err) return next(err);

				if (!valid) {
					var usernamePasswordMismatchError = [{name: 'usernamePasswordMismatch', message: 'Invalid username and passwork combination'}]
					req.session.flash = {
						err: usernamePasswordMismatchError
					}
					res.redirect('/session/new')
					return;
				}

				req.session.authenticated = true;
				req.session.User = user;

				if (req.session.User.admin) {
					res.redirect('/user')
					return;
				}

				res.redirect('/user/show/' + user.id);
			});

		});

	},

	destroy: function(req, res, next) {
		req.session.destroy();

		res.redirect('/session/new')
	}



};
