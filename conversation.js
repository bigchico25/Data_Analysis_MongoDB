const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  _id: String,
  customerPhone: String,
  receivedTimestamp: Date,
  storeId: String,
  storeMenuSlug: String,
  messages: [{
    category: String,
    customerPhone: String,
    prompt: String,
    receivedMessage: String,
    receivedTimestamp: Date,
    responseTimestamp: Date,
    sentMessage: String,
    storeId: String,
    storeMenuSlug: String,
    storePhone: String
  }]
});

const conversations = mongoose.model('conversations', conversationSchema);

module.exports = conversations;
