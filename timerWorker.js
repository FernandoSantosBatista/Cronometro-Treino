let countdownTimer;
let endTime;
let pausedTime;
let timeRemaining;

let totalTimer;
let totalStartTime;
let totalPausedTime = 0;  // Para salvar o tempo quando o total for pausado

onmessage = function (e) {
  const { command, selectedTime } = e.data;

  if (command === 'start') {
    if (countdownTimer) clearInterval(countdownTimer);
    
    if (pausedTime) {
      endTime = Date.now() + pausedTime * 1000;
    } else {
      timeRemaining = selectedTime;
      endTime = Date.now() + selectedTime * 1000;
    }

    // Inicia o cronômetro de tempo total se ainda não estiver rodando
    if (!totalStartTime) {
      totalStartTime = Date.now() - totalPausedTime;
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

      // Calcula o tempo total
      const totalTimeElapsed = Math.floor((now - totalStartTime) / 1000);
      postMessage({ totalTimeElapsed });
    }, 100);
  }

  if (command === 'pause') {
    clearInterval(countdownTimer);
    pausedTime = timeRemaining;
    
    if (totalStartTime) {
      totalPausedTime = Date.now() - totalStartTime;  // Calcula quanto tempo total já passou antes de pausar
    }
  }

  if (command === 'reset') {
    clearInterval(countdownTimer);
    pausedTime = null;
    timeRemaining = selectedTime;
    postMessage({ timeRemaining: selectedTime });
    
    // Reseta o cronômetro total
    totalStartTime = null;
    totalPausedTime = 0;
    postMessage({ totalTimeElapsed: 0 });
  }
};
