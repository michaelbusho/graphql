import jwt from 'jsonwebtoken';

export default ({ req }) => {
	const authHeader = req.get('Authorization');
	if (!authHeader) {
		req.isAuth = false;
		return { isAuthenticated: req.isAuth };
	}

	const token = authHeader.split(' ')[1];
	if (!token || token === '') {
		req.isAuth = false;
		return { isAuthenticated: req.isAuth };
	}

	let decodedToken;
	try {
		decodedToken = jwt.verify(token, process.env.JWT_KEY);
	} catch (err) {
		req.isAuth = false;
		return { isAuthenticated: req.isAuth };
	}

	if (!decodedToken) {
		req.isAuth = false;
		return { isAuthenticated: req.isAuth };
	}

	req.isAuth = true;
	return { ...decodedToken, isAuthenticated: req.isAuth };
};
