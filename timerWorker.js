let countdownTimer;
let totalTimer;
let endTime;
let pausedTime;
let timeRemaining;
let totalTime = 0;  // Variável para armazenar o tempo total

onmessage = function (e) {
  const { command, selectedTime } = e.data;

  // Cronômetro principal
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

  // Pausar cronômetro
  if (command === 'pause') {
    clearInterval(countdownTimer);
    pausedTime = timeRemaining;  // Salva o tempo restante ao pausar
  }

  // Resetar cronômetro
  if (command === 'reset') {
    clearInterval(countdownTimer);
    pausedTime = null;  // Reseta qualquer tempo pausado
    timeRemaining = selectedTime;
    postMessage({ timeRemaining: selectedTime });
  }

  // Total Timer
  if (command === 'startTotal') {
    if (totalTimer) clearInterval(totalTimer);

    totalTimer = setInterval(() => {
      totalTime++;
      postMessage({ totalTime });  // Envia o tempo total atualizado
    }, 1000);  // Atualiza a cada 1 segundo
  }

  // Resetar Total Timer
  if (command === 'resetTotal') {
    clearInterval(totalTimer);
    totalTime = 0;
    postMessage({ totalTime: 0 });  // Envia o tempo total resetado
  }
};
