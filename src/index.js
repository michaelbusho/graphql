import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import mongoose from 'mongoose';
import resolvers from './graphql/resolvers/index';
import typeDefs from './graphql/schema/index';
import isAuth from './middleware/isAuth';

const port = process.env.APP_PORT || 4000;

const startServer = async () => {
	const app = express();

	// Hide tech for security purposes
	app.disable('x-powered-by');

	// app.use(isAuth);

	const server = new ApolloServer({
		typeDefs,
		resolvers,
		context: isAuth,
	});

	server.applyMiddleware({ app });

	await mongoose.connect(
		`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		}
	);

	// The `listen` method launches a web server.
	app.listen({ port }, () => {
		console.log(`server ready at http://localhost:${port + server.graphqlPath}`);
	});
};

startServer();
