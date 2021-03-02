import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import mongoose from 'mongoose';
import resolvers from './graphql/resolvers/index';
import typeDefs from './graphql/schema/index';
import isAuth from './middleware/isAuth';

const port = process.env.PORT || 3000;

const startServer = async () => {
	const app = express();

	// Hide tech for security purposes
	app.disable('x-powered-by');

	const server = new ApolloServer({
		typeDefs,
		resolvers,

		context: isAuth,
	});

	server.applyMiddleware({ app });

	await mongoose
		.connect(
			`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@attendance-usa.bqifs.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`,
			{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
		)
		.then(() => {
			// The `listen` method launches a web server.
			app.listen(port, () => {
				console.log(`server ready on port :${port}`);
			});
		})
		.catch((err) => console.log(err));
};

startServer();
