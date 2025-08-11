let quizData = [
 
];


let currentQuestionIndex = 0;
let userAnswers = [];
let currentUser = null;

function showSignIn() {
    document.getElementById('signin-heading').classList.add('active');
    document.getElementById('signup-heading').classList.remove('active');
    document.getElementById('quiz-page').classList.remove('active');
    document.getElementById('result-page').classList.remove('active');
}

function showSignUp() {
    document.getElementById('signup-heading').classList.add('active');
    document.getElementById('signin-heading').classList.remove('active');
}

let startTime; // Variable to store the start time of the quiz

function showQuizPage() {
    document.getElementById('quiz-page').classList.add('active');
    document.getElementById('signin-heading').classList.remove('active');
    document.getElementById('signup-heading').classList.remove('active');
    document.getElementById('result-page').classList.remove('active');
    loadQuestion();
      //Record the start time when the quiz page is shown
      startTime = new Date().getTime();
}

//Fetch from Backend (Once It's Connected)
async function fetchQuizDataAndStart() {
    const token = localStorage.getItem('token');
console.log('Token from localStorage:', token);
  
    try {
        const res = await fetch('https://quiz4u.onrender.com/api/quiz', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
  
      if (!res.ok) {
        // Handle unauthorized or other errors explicitly
        if (res.status === 401 || res.status === 403) {
          alert('Unauthorized. Please log in again.');
          // Optionally redirect to login page here
        } else {
          alert(`Error fetching quiz: ${res.statusText}`);
        }
        return;
      }
  
      const data = await res.json();
  
      // Adjust this depending on your backend response shape
      quizData = data.questions || data; 
  
      shuffleQuestions();
      showQuizPage(); // this will call loadQuestion()
    } catch (err) {
      alert('Failed to load quiz. Make sure you are logged in.');
      console.error(err);
    }
  }
  
  
// Function to load the current question
function loadQuestion() {
    document.getElementById('quiz-progress').textContent = 
  `Question ${currentQuestionIndex + 1} of ${quizData.length}`;

    const questionContainer = document.getElementById('question-container');
    const questionData = quizData[currentQuestionIndex];

    if (!questionData) {
        questionContainer.innerHTML = '<p>No questions available.</p>';
        return;
      }
      
    questionContainer.innerHTML = `<div class='quiz-class'>
        <p>${questionData.question}</p>
        <div class='quiz-radio-text'>
            ${questionData.options.map((option, idx) => `
                <input type="radio" name="answer" id="option${idx}" value="${option}">
                <label for="option${idx}">${option}</label><br>
            `).join('')}
        </div>
    </div>`;

    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const selectedAnswer = userAnswers[currentQuestionIndex];

    // Reset button states
    nextBtn.disabled = true;
    submitBtn.disabled = true;

    // If on the last question, hide the Next button and show Submit
    if (currentQuestionIndex === quizData.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }

    // Restore previously selected answer
    if (selectedAnswer) {
        const radio = document.querySelector(`input[value="${selectedAnswer}"]`);
        if (radio) {
            radio.checked = true;

            // Enable the appropriate button
            if (currentQuestionIndex === quizData.length - 1) {
                submitBtn.disabled = false;
            } else {
                nextBtn.disabled = false;
            }
        }
    }

    // Enable button on radio change
    document.querySelectorAll('input[name="answer"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (currentQuestionIndex === quizData.length - 1) {
                submitBtn.disabled = false;
            } else {
                nextBtn.disabled = false;
            }
        });
    });
}


function checkAnswers() {
    let score = 0;
    userAnswers.forEach((answer, idx) => {
        if (answer === quizData[idx].answer) score++;
    });
    return score;
}


function showResultPage() {
    const result = checkAnswers();
    let resultMessage = "";
    const resultElement = document.getElementById('result');

     // Calculate the time spent on the quiz
     const endTime = new Date().getTime();
     const timeSpent = endTime - startTime; // Time in milliseconds
 
     // Convert milliseconds to hours, minutes, and seconds
     const hours = Math.floor(timeSpent / (1000 * 60 * 60)); // Calculate hours
     const minutes = Math.floor((timeSpent % (1000 * 60 * 60)) / (1000 * 60)); // Calculate minutes
     const seconds = Math.floor((timeSpent % (1000 * 60)) / 1000); // Calculate seconds
 
    // Display the message based on the score
    if (result >= 5) {
        resultMessage = `Congratulations! You passed the quiz with ${result} out of ${quizData.length} correct answers.`;
        
        // Change result text color to green (pass)
        resultElement.style.color = '#003636';
        resultElement.style.backgroundColor = '#e0ffff';
        resultElement.style.padding = '10px';  // Padding around the text
        resultElement.style.borderRadius = '5px';  
        resultElement.style.lineHeight = '1.6';
        
        // Disable the "Try Again" button if the user passes
        document.getElementById('retry-btn').disabled = true; // Disable "Try Again" button on pass
    } else {
        resultMessage = `You failed the quiz with ${result} out of ${quizData.length} correct answers. Try again!`;
        
        // Change result text color to red (fail)
        resultElement.style.color = '#800000';
        resultElement.style.backgroundColor = '#e0ffff';  // Light red background color (adjust as needed)
        resultElement.style.padding = '10px';  // Padding around the text
        resultElement.style.borderRadius = '5px';  
        resultElement.style.lineHeight = '1.6';
        
        // Enable the "Try Again" button if the user fails
        document.getElementById('retry-btn').disabled = false; // Enable "Try Again" button on fail
    }
     // Format time in hours, minutes, and seconds (hh:mm:ss)
     const formattedTime = `${hours}:${minutes}:${seconds}s`;

      // Add the time spent to the result message
      resultMessage += `<br><strong>Time taken: ${formattedTime}</strong>`;

    resultElement.innerHTML = resultMessage;
    document.getElementById('result-page').classList.add('active');
    document.getElementById('quiz-page').classList.remove('active');

}

// Function to shuffle the questions array
function shuffleQuestions() {
    for (let i = quizData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [quizData[i], quizData[j]] = [quizData[j], quizData[i]]; // Swap
    }
}


// Sign In logic

document.getElementById('signin-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  
  const username = document.getElementById('signin-username').value;
  const password = document.getElementById('signin-password').value;

  try {
    const response = await fetch('https://quiz4u.onrender.com/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
  
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      currentUser = data.username;

      document.getElementById('greet-message').innerHTML = `Welcome, ${currentUser}!`;
      fetchQuizDataAndStart();
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    console.error('Error:', err);   // console logs to see where it's failing:
    alert('Network error');
  }
});


document.getElementById('signup-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
   
    try {
      const response = await fetch('https://quiz4u.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Sign up successful. Please sign in.');
        showSignIn();
        this.reset();
      } else {
        alert(data.message || 'Failed to sign up');
      }
    } catch (err) {
      console.log('ERROR..', err);
      alert('Network error');
    }
  });
  
// Toggle show/hide password for sign-up
document.getElementById('password-if').addEventListener('change', function() {
    const passwordField = document.getElementById('signup-password');
    if (this.checked) {
        passwordField.type = 'text';  // Show the password
    } else {
        passwordField.type = 'password';  // Hide the password
    }
});

// Toggle show/hide password for sign-In
document.getElementById('signIn-password-if').addEventListener('change', function() {
    const passwordFieldIn = document.getElementById('signin-password');
    if (this.checked) {
        passwordFieldIn.type = 'text';  // Show the password
    } else {
        passwordFieldIn.type = 'password';  // Hide the password
    }
});



document.getElementById('next-btn').addEventListener('click', function() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (selectedOption) {
        userAnswers[currentQuestionIndex] = selectedOption.value;
    }
    currentQuestionIndex++;
    if (currentQuestionIndex >= quizData.length) {
        currentQuestionIndex = quizData.length - 1;
        document.getElementById('next-btn').disabled = true; // Disable Next on last question
    }
    loadQuestion();
    document.getElementById('prev-btn').disabled = false;
});


document.getElementById('prev-btn').addEventListener('click', function () {
    currentQuestionIndex--;

    // Clamp to minimum
    if (currentQuestionIndex <= 0) {
        currentQuestionIndex = 0;
        this.disabled = true; // Disable Previous on first question
    }

    loadQuestion(); // Re-load the updated question

    // Always enable Next if not on last
    if (currentQuestionIndex < quizData.length - 1) {
        document.getElementById('next-btn').disabled = false;
    }
});

document.getElementById('submit-btn').addEventListener('click', showResultPage);

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', logout);

function logout() {
    currentUser = null;
    userAnswers = [];
    document.getElementById('result-page').classList.remove('active');
    document.getElementById('quiz-page').classList.remove('active');
    document.getElementById('signin-heading').classList.add('active');
    document.getElementById('signup-heading').classList.remove('active');

      // Refresh the page to fully log out and reset everything
      location.reload();
}

// Retry logic after failing quiz
document.getElementById('retry-btn').addEventListener('click', function() {
    currentQuestionIndex = 0;
    userAnswers = [];
    shuffleQuestions();  // Shuffle questions after retry
    loadQuestion();
    document.getElementById('result-page').classList.remove('active');
    document.getElementById('quiz-page').classList.add('active');

});


window.onload = function() {
    showSignIn();
    document.getElementById('signin-username').focus();
};
