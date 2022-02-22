const { PubSub } = require('graphql-subscriptions');
const Message = require('../../model/message');

const pubsub = new PubSub();

module.exports = {

    Query: {
        async message(_, { ID }) {
            return await Message.findById(ID);
        }
    },

    Mutation: {
        async createMessage(
            _,
            { messageInput: { text, username } })
        {
            const newMessage = new Message({
                text: text,
                createdBy: username
            });

            const res = await newMessage.save();

            pubsub.publish('MESSAGE_CREATED', {
                messageCreated: {
                    text: text,
                    createdBy: username
                }
            });

            return {
                id: res.id,
                ...res._doc
            }
        }
    },
    Subscription: {
        messageCreated: {
            subscribe: () => pubsub.asyncIterator('MESSAGE_CREATED')
        }
    }
}