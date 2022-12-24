import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

//load animation via vannila js

function loader(element) {
  //initially
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

//typing one by one functionality in vannila js

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    // if we are still typing
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      //when we reach end of the text
      clearInterval(interval);
    }
  }, 20);
}

//unique id for new msg

function generateUniqueId() {
  const randomNumber = crypto.randomUUID();

  return `id-${randomNumber}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi && "ai"}">
    <div class="chat">
        <div class="profile">
            <img src=${isAi ? bot : user} alt=${isAi ? "bot" : "user"} />
        </div>
        <div class="message" id=${uniqueId}>
        ${value}
        </div>
    </div>
  </div>
    
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  //user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  //clear chat
  form.reset();

  //bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  //new message in view ,

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  //fetch data from server

  const response = await fetch("https://codex-nvpt.onrender.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    console.log(parsedData);

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
