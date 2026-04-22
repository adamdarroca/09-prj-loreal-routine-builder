let typingIndicatorRow = null;

function escapeHtml(text) {
  if (typeof text !== "string") {
    return "";
  }

  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeAssistantHtml(rawHtml) {
  const allowedTags = new Set([
    "p",
    "br",
    "strong",
    "em",
    "ul",
    "ol",
    "li",
    "h3",
  ]);

  const template = document.createElement("template");
  template.innerHTML = rawHtml;

  const allNodes = template.content.querySelectorAll("*");
  allNodes.forEach((node) => {
    const tagName = node.tagName.toLowerCase();

    if (!allowedTags.has(tagName)) {
      const textNode = document.createTextNode(node.textContent || "");
      node.replaceWith(textNode);
      return;
    }

    // Remove all attributes from allowed tags.
    while (node.attributes.length > 0) {
      node.removeAttribute(node.attributes[0].name);
    }
  });

  return template.innerHTML.trim();
}

function formatAssistantMessage(text) {
  if (typeof text !== "string") {
    return "";
  }

  const trimmedText = text.trim();
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(trimmedText);

  if (looksLikeHtml) {
    return sanitizeAssistantHtml(trimmedText);
  }

  return `<p>${escapeHtml(trimmedText)}</p>`;
}

function appendMessage(role, text) {
  const chatWindow = document.getElementById("chatWindow");

  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  const msgBubble = document.createElement("div");
  msgBubble.className = `msg ${role}`;

  if (role === "assistant") {
    msgBubble.innerHTML = formatAssistantMessage(text);
  } else {
    msgBubble.textContent = text;
  }

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
