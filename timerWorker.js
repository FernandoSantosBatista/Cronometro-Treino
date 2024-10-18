let timeRemaining = 0;
let interval = null;

self.onmessage = function (e) {
  const { command, selectedTime } = e.data;

  if (command === 'start') {
    timeRemaining = selectedTime;
    interval = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 0) {
        clearInterval(interval);
      }
      postMessage({ timeRemaining });
    }, 1000);
  } else if (command === 'pause') {
    clearInterval(interval);
  } else if (command === 'reset') {
    clearInterval(interval);
    timeRemaining = selectedTime;
    postMessage({ timeRemaining });
  }
};
