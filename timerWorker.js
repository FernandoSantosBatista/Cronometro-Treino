let countdownTimer;
let totalTimer;
let endTime;
let pausedTime;
let timeRemaining;
let totalTime = 0; // Variável para armazenar o tempo total
let totalStartTime; // Para controlar o início do Total Timer
let totalTimerRunning = false; // Flag para verificar se o total timer já está rodando

onmessage = function (e) {
  const { command, selectedTime } = e.data;

  // Cronômetro principal
  if (command === "start") {
    if (countdownTimer) clearInterval(countdownTimer);

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
    }, 100); // Atualiza a cada 100ms para maior precisão
  }

  // Pausar cronômetro
  if (command === "pause") {
    clearInterval(countdownTimer);
    pausedTime = timeRemaining; // Salva o tempo restante ao pausar
  }

  // Retomar cronômetro
  if (command === "resume") {
    if (pausedTime) {
      endTime = Date.now() + pausedTime * 1000; // Define o novo endTime ao retomar
      countdownTimer = setInterval(() => {
        const now = Date.now();
        timeRemaining = Math.round((endTime - now) / 1000);

        if (timeRemaining <= 0) {
          clearInterval(countdownTimer);
          postMessage({ timeRemaining: 0 });
        } else {
          postMessage({ timeRemaining });
        }
      }, 100);
      pausedTime = null; // Limpa o tempo pausado após retomar
    }
  }

  // Resetar cronômetro
  if (command === "reset") {
    clearInterval(countdownTimer);
    pausedTime = null; // Reseta qualquer tempo pausado
    timeRemaining = selectedTime;
    postMessage({ timeRemaining: selectedTime });
  }

  // Total Timer
  if (command === "startTotal" && !totalTimerRunning) {
    totalStartTime = Date.now() - totalTime * 1000; // Ajusta para levar em conta o tempo já decorrido
    totalTimerRunning = true;

    totalTimer = setInterval(() => {
      const now = Date.now();
      totalTime = Math.floor((now - totalStartTime) / 1000); // Baseia-se no tempo real decorrido
      postMessage({ totalTime }); // Envia o tempo total atualizado
    }, 1000); // Atualiza a cada 1 segundo
  }

  // Resetar Total Timer
  if (command === "resetTotal") {
    clearInterval(totalTimer);
    totalTime = 0;
    totalTimerRunning = false;
    postMessage({ totalTime: 0 }); // Envia o tempo total resetado
  }
};
