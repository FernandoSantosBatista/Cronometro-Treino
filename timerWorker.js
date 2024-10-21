let countdownTimer;
let endTime;
let pausedTime;
let timeRemaining;

onmessage = function (e) {
  const { command, selectedTime } = e.data;

  if (command === 'start') {
    if (countdownTimer) clearInterval(countdownTimer);

    // Se o tempo estava pausado, retoma a partir de onde parou
    if (pausedTime) {
      endTime = Date.now() + pausedTime * 1000;
    } else {
      timeRemaining = selectedTime;
      endTime = Date.now() + selectedTime * 1000;
    }

    countdownTimer = setInterval(() => {
      const now = Date.now();
      timeRemaining = Math.round((endTime - now) / 1000);

      if (timeRemaining <= 0) {
        clearInterval(countdownTimer);
        postMessage({ timeRemaining: 0 });
      } else {
        postMessage({ timeRemaining });
      }
    }, 100);  // Atualize a cada 100ms para maior precisão
  }

  if (command === 'pause') {
    clearInterval(countdownTimer);
    pausedTime = timeRemaining;  // Salva o tempo restante ao pausar
  }

  if (command === 'reset') {
    clearInterval(countdownTimer);
    pausedTime = null;  // Reseta qualquer tempo pausado
    timeRemaining = selectedTime;
    postMessage({ timeRemaining: selectedTime });
  }
};
