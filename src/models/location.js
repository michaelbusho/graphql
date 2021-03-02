import mongoose from 'mongoose';
import appearanceSchema from './appearance';

const Schema = mongoose.Schema;

const locationSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	capacity: {
		type: Number,
		required: true,
	},
	address: {
		type: String,
	},
	phone_number: {
		type: String,
	},
	email: {
		type: String,
	},
	description: {
		type: String,
	},
});

//Middleware to cascade delete
locationSchema.pre('deleteOne', { document: false, query: true }, async function () {
	const doc = await this.model.findOne(this.getFilter());
	await appearanceSchema.deleteMany({ location: doc._id });
});

export default mongoose.model('Location', locationSchema);
