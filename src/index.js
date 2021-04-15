import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import mongoose from 'mongoose';
import resolvers from './graphql/resolvers/index';
import typeDefs from './graphql/schema/index';
import isAuth from './middleware/isAuth';
import rateLimit from 'express-rate-limit';
import { createRedisCache } from './utils/functions';

const port = parseInt(process.env.PORT) || 3000;

const startServer = async () => {
	const app = express();

	// Hide tech for security purposes
	app.disable('x-powered-by');

	//Create a Redis Cache
	const cache = createRedisCache();

	//Rate limiter
	const apiLimiter = rateLimit({
		windowMs: parseInt(process.env.RATE_LIMIT_WINDOW), // 1 minute
		max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS),
		message: 'Too many Requests. Please allow some time to cool down',
	});

	app.use(apiLimiter);

	const server = new ApolloServer({
		typeDefs,
		resolvers,
		persistedQueries: {
			cache: cache,
		},
		context: ({ req }) => ({
			isAuth: isAuth(req),
			cache: cache,
		}),
		formatError: function (error) {
			return {
				message: error && error.message,
				statusCode:
					error &&
					error.extensions &&
					error.extensions.exception &&
					error.extensions.exception.statusCode,
				status:
					error &&
					error.extensions &&
					error.extensions.exception &&
					error.extensions.exception.status,
			};
		},
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
