const form = document.querySelector("#chatForm");
const input = document.querySelector("#messageInput");
const messagesEl = document.querySelector("#messages");
const personaTabs = Array.from(document.querySelectorAll(".persona-tab"));
const activePersonaLabel = document.querySelector("#activePersonaLabel");
const activePersonaImage = document.querySelector("#activePersonaImage");
const requestState = document.querySelector("#requestState");
const errorBanner = document.querySelector("#errorBanner");
const clearChatButton = document.querySelector("#clearChat");
const sendButton = document.querySelector("#sendButton");
const emptyState = document.querySelector("#emptyState");
const promptChips = Array.from(document.querySelectorAll(".prompt-chip"));

const pipelineSteps = ["initial", "think", "analyze", "output"];
const personaLabels = {
  hitesh: "Hitesh Choudhary style",
  piyush: "Piyush Garg style",
};
const personaImages = {
  hitesh: "/images/hitesh.jpg",
  piyush: "/images/piyush.jpg",
};

let selectedPersona = "hitesh";
let messages = [];
let isSubmitting = false;

function setRequestState(label, busy = false) {
  requestState.textContent = label;
  requestState.classList.toggle("is-busy", busy);
}

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.hidden = false;
}

function clearError() {
  errorBanner.hidden = true;
  errorBanner.textContent = "";
}

function updateEmptyState() {
  emptyState.hidden = messages.length > 0;
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function createMessageLabel(role) {
  const label = document.createElement("div");
  label.className = "message-label";

  if (role === "assistant") {
    const avatar = document.createElement("img");
    avatar.className = "message-avatar";
    avatar.src = personaImages[selectedPersona];
    avatar.alt = personaLabels[selectedPersona];

    const name = document.createElement("span");
    name.textContent = personaLabels[selectedPersona];

    label.append(avatar, name);
    return label;
  }

  label.textContent = "You";
  return label;
}

function appendMessage(role, content) {
  const item = document.createElement("article");
  item.className = `message message-${role}`;

  const label = createMessageLabel(role);

  const body = document.createElement("div");
  body.className = "message-body";
  body.textContent = content;

  item.append(label, body);
  messagesEl.appendChild(item);
  updateEmptyState();
  scrollToBottom();
}

function appendLoadingMessage() {
  const item = document.createElement("article");
  item.className = "message message-assistant message-loading";
  item.dataset.loading = "true";

  const label = createMessageLabel("assistant");
  const typing = document.createElement("div");
  typing.className = "typing";
  typing.setAttribute("aria-label", "Assistant is thinking");
  typing.innerHTML = "<span></span><span></span><span></span>";

  item.append(label, typing);
  messagesEl.appendChild(item);
  updateEmptyState();
  scrollToBottom();
  return item;
}

function removeLoadingMessage(loadingEl) {
  if (loadingEl) loadingEl.remove();
  updateEmptyState();
}

function setSubmitting(nextSubmitting) {
  isSubmitting = nextSubmitting;
  sendButton.disabled = nextSubmitting;
  input.disabled = nextSubmitting;
  personaTabs.forEach((tab) => {
    tab.disabled = nextSubmitting;
  });
}

function setPersona(persona) {
  selectedPersona = persona;
  activePersonaLabel.textContent = personaLabels[persona];
  activePersonaImage.src = personaImages[persona];
  activePersonaImage.alt = personaLabels[persona];

  personaTabs.forEach((tab) => {
    const isActive = tab.dataset.persona === persona;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-checked", String(isActive));
  });
}

async function requestStep(step, pipelineMessages) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      persona: selectedPersona,
      step,
      messages: pipelineMessages,
    }),
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || "Could not reach the AI service. Please try again.");
  }

  pipelineMessages.push({
    role: "assistant",
    content: JSON.stringify(data),
  });

  console.debug(`[${data.step}]`, data.content);
  return data;
}

async function submitMessage(content) {
  if (isSubmitting || !content) return;

  clearError();
  const userMessage = { role: "user", content };
  messages.push(userMessage);
  appendMessage("user", content);

  const loadingEl = appendLoadingMessage();
  setSubmitting(true);
  setRequestState("Thinking", true);

  try {
    const pipelineMessages = [...messages];
    let finalResponse = null;

    for (const step of pipelineSteps) {
      setRequestState(step === "output" ? "Writing" : "Thinking", true);
      const stepResponse = await requestStep(step, pipelineMessages);

      if (stepResponse.step === "output") {
        finalResponse = stepResponse;
      }
    }

    removeLoadingMessage(loadingEl);

    if (!finalResponse) {
      throw new Error("No final response received.");
    }

    messages.push({
      role: "assistant",
      content: finalResponse.content,
    });
    appendMessage("assistant", finalResponse.content);
    setRequestState("Ready");
  } catch (error) {
    removeLoadingMessage(loadingEl);
    showError(error.message || "Something went wrong. Please try again.");
    setRequestState("Error");
  } finally {
    setSubmitting(false);
    input.focus();
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = input.value.trim();
  if (!content) return;

  input.value = "";
  input.style.height = "auto";
  await submitMessage(content);
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

personaTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (isSubmitting) return;
    setPersona(tab.dataset.persona);
  });
});

promptChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    input.value = chip.dataset.prompt;
    input.focus();
    input.dispatchEvent(new Event("input"));
  });
});

clearChatButton.addEventListener("click", () => {
  if (isSubmitting) return;
  messages = [];
  Array.from(messagesEl.querySelectorAll(".message")).forEach((message) => message.remove());
  clearError();
  setRequestState("Ready");
  updateEmptyState();
  input.focus();
});

setPersona(selectedPersona);
updateEmptyState();
