import { Cat } from './models/Cat';

export default {
	Query: {
		hello: () => 'hello',
		cats: () => Cat.find(),
	},
	Mutation: {
		createCat: (_, { name }) => {
			const kitty = new Cat({ name });
			return kitty.save();
		},
	},
};
