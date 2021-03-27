# Attendance API

[![Build Status](https://img.shields.io/circleci/build/github/michaelbusho/graphql)](https://img.shields.io/circleci/build/github/michaelbusho/graphql)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=michaelbusho_graphql&metric=alert_status)](https://sonarcloud.io/dashboard?id=michaelbusho_graphql)
[![js-airbnb-style](https://img.shields.io/badge/code%20style-airbnb-blue)](https://github.com/airbnb/javascript)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=michaelbusho_graphql&metric=coverage)](https://sonarcloud.io/dashboard?id=michaelbusho_graphql)

[![Known Vulnerabilities](https://snyk.io/test/github/michaelbusho/graphql/badge.svg)](https://snyk.io/test/github/michaelbusho/graphql)

![Cover Image](./resources/cover_image.png)

#

A little info about your project and/ or overview that explains **what** the project is about.

## Motivation

A short description of the motivation behind the creation and maintenance of the project. This should explain **why** the project exists.

## Tech/framework used

Ex. -

<b>Built with</b>

- [Node](https://nodejs.org/en/)
- [Graphql](https://graphql.org/)
- [Apollo Server](https://www.apollographql.com/)
- [Mongodb](https://www.mongodb.com/)

## Features

What makes your project stand out?

## Code Example

Show what the library does as concisely as possible, developers should be able to figure out **how** your project solves their problem by looking at the code example. Make sure the API you are showing off is obvious, and that your code is short and concise.

## Installation

Provide step by step series of examples and explanations about how to get a development env running. Example
Install node then

```
npm install
node run start:demon
```

## API Reference

Depending on the size of the project, if it is small and simple enough the reference docs can be added to the README. For medium size to larger projects it is important to at least provide a link to where the API reference docs live.

### Users:

```graphql
type User {
	_id: ID!
	rfid: String!
	role: Roles!
	permissions: [String!]!
	email: String!
	password: String
	name: String!
	lastName: String!
	health_status: HealthStatus!
	address: String
	phone_number: String
	image: String
}
```

User Queries:

```graphql
findUserByRfid(rfid: String!): User!
users: [User]!
login(email: String!, password: String!): AuthData!
```

User Mutations:

```graphql
createUser(UserInput: UserInput): User
updateUser(userID: ID!, UserInput: UserInputUpdate): User
deleteUser(userID: ID!): User
```

### Locations:

```graphql
type Location {
	_id: ID!
	name: String!
	capacity: Int!
	address: String
	phone_number: String
	email: String
	description: String
}
```

Location Queries:

```graphql
locations: [Location]
findLocationById(location_id: String!): Location
```

Location Mutations:

```graphql
createLocation(LocationInput: LocationInput): Location
updateLocation(locationID: ID!, LocationInput: LocationInputUpdate): Location
deleteLocation(locationID: ID!): Location
```

### Appearances:

```graphql
type Appearance {
	_id: ID!
	location: Location!
	user: User!
	createdAt: String
}
```

Appearance Queries:

```graphql
findUserAppearances(user_id: String!): [Appearance]
findLocationAppearances(location_id: String!): [Appearance]
```

Appearance Mutations:

```graphql
createAppearance(user_id: String!, location_id: String!): Appearance
deleteAppearance(appearanceID: ID!): Appearance
```

## Tests

Describe and show how to run the tests with code examples.

## How to use?

If people like your project they’ll want to learn how they can use it. To do so include step by step guide to use your project.

## Credits

Give proper credits. This could be a link to any repo which inspired you to build this project, any blogposts or links to people who contrbuted in this project.

#### VSCODE plugins

- ESLint
- Gitlens
- Graphql for vscode
- live server
- prettier
- vscode-icons

## License

A short snippet describing the license (MIT, Apache etc)

MIT © [Yourname]()
