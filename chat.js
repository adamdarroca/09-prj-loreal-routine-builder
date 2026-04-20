const messages = [
  {
    role: "system",
    content: APP_CONFIG.systemPrompt
  },
];

function addUserMessage(text) {
  messages.push({
    role: "user",
    content: text,
  });
}

function addAssistantMessage(text) {
  messages.push({
    role: "assistant",
    content: text,
  });
}

function getMessages() {
  return messages;
}

function trimMessages(maxNonSystemMessages = 10){
  const systemMessages = messages[0];
  const recentMessages = messages.slice(-maxNonSystemMessages);
  messages.length = 0;
  messages.push(systemMessages, ...recentMessages);
}