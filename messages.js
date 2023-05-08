const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
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
});

const messages = mongoose.model('messages', messageSchema);

module.exports = messages;
