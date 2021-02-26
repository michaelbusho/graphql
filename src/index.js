import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import mongoose from 'mongoose';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/schemas/typeDefs';

const port = process.env.PORT || 4000;

const startServer = async () => {
	const app = express();

	const server = new ApolloServer({
		typeDefs,
		resolvers,
	});

	server.applyMiddleware({ app });

	await mongoose.connect('mongodb://localhost:27017/attendanceSystem', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	// The `listen` method launches a web server.
	app.listen({ port }, () => {
		console.log(`server ready at http://localhost:${port + server.graphqlPath}`);
	});
};

startServer();
