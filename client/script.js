 import bot from './assets/bot.svg';
 import user from './assets/user.svg';

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval;

function loader(element){
  //3 dots will generated ('...') to show loading process
  element.textContent = ''

  loadInterval = setInterval(() => {
    element.textContent += '.'

    if(element.textContent === '....'){
      element.textContent = ''
    }
  }, 300)
}

function typeText(element, text) {
  let index = 0;

  //outputs the text answer one letter at a time
  let interval = setInterval(() => {
    if(index < text.length){
      element.innerHTML += text.charAt(index)
      index++
    } else {
      clearInterval(interval)
    }
  }, 20)
}

function generateUniqueId() {
  //each answer the AI provides is associated with a unique ID
  const timestamp = Date.now()
  const randomNumber = Math.random()
  const hexadecimalString = randomNumber.toString(16)

  return `id-${timestamp}-${hexadecimalString}`
}

function chatBox (isAI, value, uniqueId) {
  //creates a chat output format for the user question and AI answer
  return(
    `
      <div class = "wrapper ${isAI && 'ai'}">
        <div class= "chat">
          <div class= "profile">
            <img
              src="${isAI ? bot : user}"
              alt= "${isAI ? 'bot' : 'user'}"
            />
          </div>
          <div class = "message" id = ${uniqueId}>${value}</div>
        </div>
      </div>
    `

  )
}

const handleSubmit = async (e) => {
  e.preventDefault();
  
  //reads the user data
  const data = new FormData(form)

  //user's chatstripe
  chatContainer.innerHTML += chatBox(false, data.get('prompt'));
  form.reset();

  //AI's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatBox(true, " ", uniqueId);

  //puts new message/response in view on the app
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  //fetch data/bot's response from the backend server
  const response = await fetch('http://localhost:8000', {
    method: 'POST',
    headers:{
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  //clears loading dots
  clearInterval(loadInterval)
  messageDiv.innerHTML = ''

  if(response.ok){
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = " Something went wrong"

    alert(err)
  }


}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keycap', (e) => {
  if(e.KeyCode === 13){
    handleSubmit(e);
  }
})