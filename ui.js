function appendMessage(role, text) {
  const chatWindow = document.getElementById("chatWindow");

  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  const msgBubble = document.createElement("div");
  msgBubble.className = `msg ${role}`;
  msgBubble.textContent = text;

  row.appendChild(msgBubble);
  chatWindow.appendChild(row);

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function setStatus(text) {
  const statusText = document.getElementById("statusText");
  if (statusText) {
    statusText.textContent = text;
  }
}

function setLoading(isLoading) {
  const sendBtn = document.getElementById("sendBtn");
  const userInput = document.getElementById("userInput");

  userInput.disabled = isLoading;
  sendBtn.disabled = isLoading;
  if (isLoading) {
    userInput.focus();
  }

  if (sendBtn) {
    sendBtn.disabled = isLoading;
  }

  if (isLoading) {
    setStatus("Thinking...");
  } else {
    setStatus("");
    if (userInput) {
      userInput.focus();
    }
  }
}