import User from '../../models/user';
import bcrypt from 'bcryptjs';

const getPermission = (role) => {
	return ['create_user'];
};

const rfidExists = (User, rfid) => {
	return User.findOne({ rfid: rfid }).then((found_user) => {
		if (found_user) {
			return true;
		}
	});
};

export default {
	Query: {
		users: () => User.find(),
	},

	Mutation: {
		createUser: (_, { UserInput }) => {
			const { rfid, role, image, email, password } = UserInput;

			// Make sure that email and rfid don't already exist. If not then save
			User.findOne({ email: email })
				.then((found_user) => {
					if (found_user) {
						throw new Error('User exists already.');
					} else {
						if (rfidExists(User, rfid)) {
							throw new Error('RFID must be unique.');
						}
					}
					return bcrypt.hash(password, parseInt(process.env.HASH_SALT));
				})
				.then((hashed_pass) => {
					const permissions = getPermission(role);
					const new_user = new User({
						rfid,
						role,
						permissions,
						image,
						email,
						password: hashed_pass,
					});
					return new_user.save();
				})
				.catch((err) => {
					console.error(err);
				});
		},
	},
};
