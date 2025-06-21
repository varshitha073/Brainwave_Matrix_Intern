document.getElementById('subscribeForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const emailInput = this.querySelector('input[type="email"]');
  const message = document.getElementById('formMessage');
  
  if (emailInput.value.includes('@')) {
    message.textContent = "🎉 Thanks for subscribing!";
    message.style.color = "green";
  } else {
    message.textContent = "Please enter a valid email address.";
    message.style.color = "red";
  }
});
