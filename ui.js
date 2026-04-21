let typingIndicatorRow = null;

function formatAssistantMessage(text) {
  if (typeof text !== "string") {
    return "";
  }

  return text.replace(/(\d+\.)\s*/g, "\n$1 ").trim();
}

function appendMessage(role, text) {
  const chatWindow = document.getElementById("chatWindow");

  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  const msgBubble = document.createElement("div");
  msgBubble.className = `msg ${role}`;
  msgBubble.textContent =
    role === "assistant" ? formatAssistantMessage(text) : text;

  row.appendChild(msgBubble);
  chatWindow.appendChild(row);

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTypingIndicator() {
  const chatWindow = document.getElementById("chatWindow");

  if (typingIndicatorRow) {
    return;
  }

  typingIndicatorRow = document.createElement("div");
  typingIndicatorRow.className = "msg-row assistant typing-row";

  const typingBubble = document.createElement("div");
  typingBubble.className = "msg assistant typing-bubble";
  typingBubble.setAttribute("aria-label", "AI is typing");

  const dots = document.createElement("div");
  dots.className = "typing-dots";

  for (let index = 0; index < 3; index += 1) {
    const dot = document.createElement("span");
    dot.className = "typing-dot";
    dot.style.animationDelay = `${index * 0.16}s`;
    dots.appendChild(dot);
  }

  typingBubble.appendChild(dots);
  typingIndicatorRow.appendChild(typingBubble);
  chatWindow.appendChild(typingIndicatorRow);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function hideTypingIndicator() {
  if (typingIndicatorRow) {
    typingIndicatorRow.remove();
    typingIndicatorRow = null;
  }
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
    showTypingIndicator();
    setStatus("Thinking...");
  } else {
    hideTypingIndicator();
    setStatus("");
    if (userInput) {
      userInput.focus();
    }
  }

  if (isLoading && userInput) {
    userInput.focus();
  }

  if (sendBtn) {
    sendBtn.disabled = isLoading;
  }
}
