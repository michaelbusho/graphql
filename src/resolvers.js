import {Cat} from './models/Cat';

export const resolvers = {
    Query: {
        hello: ()=> "hello",
        cats: () => Cat.find()
    },
    Mutation: {
        createCat: (_, {name}) =>{
            const kitty = new Cat({name});
            return kitty.save();
        }
    }
}