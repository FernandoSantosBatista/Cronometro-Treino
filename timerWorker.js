let countdownTimer;
let timeRemaining;

onmessage = function (e) {
  const { command, selectedTime } = e.data;

  if (command === 'start') {
    if (countdownTimer) clearInterval(countdownTimer);

    timeRemaining = selectedTime;
    
    countdownTimer = setInterval(() => {
      timeRemaining--;
      postMessage({ timeRemaining });

      if (timeRemaining <= 0) {
        clearInterval(countdownTimer);
        postMessage({ timeRemaining: 0 });
      }
    }, 1000);
  }

  if (command === 'pause') {
    clearInterval(countdownTimer);
  }

  if (command === 'reset') {
    clearInterval(countdownTimer);
    timeRemaining = selectedTime;
    postMessage({ timeRemaining: selectedTime });
  }
};
