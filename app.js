const mongoose = require('mongoose');
const messages = require('./messages');
const conversations = require('./conversation');

const connectDb = async () => {
  await mongoose.connect("mongodb://localhost:27017/brendi", { useNewUrlParser: true});
  console.log('MongoDB conectado!');
  await groupMessagesIntoConversations();
}

// Função para agrupar mensagens em conversas

async function groupMessagesIntoConversations() {
  const allMessages = await messages.find({}).sort({receivedTimestamp: 1}).exec();

  let currentConversation = null;
  let lastMessageTimestamp = null;

  for (let i = 0; i < allMessages.length; i++) {
    const message = allMessages[i];

    if (currentConversation === null || message.customerPhone !== currentConversation.customerPhone || message.storeId !== currentConversation.storeId) {
      // Início de uma nova conversa
      const conversationId = `${message.customerPhone}-${message.storeId}-${message.receivedTimestamp.getTime()}`;
      currentConversation = new conversations({
        _id: conversationId,
        customerPhone: message.customerPhone,
        receivedTimestamp: message.receivedTimestamp,
        storeId: message.storeId,
        storeMenuSlug: message.storeMenuSlug,
        messages: []
      });
      lastMessageTimestamp = message.receivedTimestamp;
      currentConversation.messages.push(message);
      await currentConversation.save();
    } else {
      // Continuação da conversa atual
      const timeDiff = (message.receivedTimestamp - lastMessageTimestamp) / (1000 * 60 * 60);
      if (timeDiff > 4) {
        // Fim da conversa atual, início de uma nova
        const conversationId = `${message.customerPhone}-${message.storeId}-${message.receivedTimestamp.getTime()}`;
        currentConversation = new conversations({
          _id: conversationId,
          customerPhone: message.customerPhone,
          receivedTimestamp: message.receivedTimestamp,
          storeId: message.storeId,
          storeMenuSlug: message.storeMenuSlug,
          messages: [message]
        });
        lastMessageTimestamp = message.receivedTimestamp;
        await currentConversation.save();
      } else {
        // Continuação da conversa atual
        currentConversation.messages.push(message);
        await currentConversation.save();
      }
    }
  }
  
  console.log("Mensagens agrupadas em conversas com sucesso!");

    // Obter a lista de menu-slugs existentes e o total de conversas para cada menu-slug
    const menuSlugCounts = {};
    const allConversations = await conversations.find({}).exec();
    allConversations.forEach(conversation => {
      const menuSlug = conversation.messages[0].storeMenuSlug;
      if (menuSlug in menuSlugCounts) {
        menuSlugCounts[menuSlug]++;
      } else {
        menuSlugCounts[menuSlug] = 1;
      }
    });
  
    console.log("Menu-slugs e total de conversas:");
    for (const [menuSlug, count] of Object.entries(menuSlugCounts)) {
      console.log(`${menuSlug} | ${count} conversas`);
    }
}

connectDb();