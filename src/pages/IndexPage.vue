<template>
  <q-page padding class="flex flex-center q-pa-md">
    <div class="timer-container text-center">
      <div class="timer-row">
        <span id="timer">{{ formattedTime }}</span>
        <span id="rest-count">x {{ restCount }}</span>
      </div>

      <div class="button-container">
        <q-btn
          outline
          :icon="playPauseIcon"
          @click="togglePlayPause"
          rounded
          push
          size="md"
          class="timer-button"
        />
        <q-btn
          outline
          icon="refresh"
          @click="resetTimer"
          rounded
          push
          size="md"
          class="timer-button"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      time: 5, // O tempo inicial
      restCount: 0,
      interval: null,
      isRunning: false, // Verifica se o cronômetro está rodando
      isPaused: false, // Verifica se o cronômetro está pausado
    };
  },
  computed: {
    formattedTime() {
      return this.time < 10 ? "0" + this.time : this.time;
    },
    playPauseIcon() {
      return this.isRunning && !this.isPaused ? "pause" : "play_arrow";
    },
  },
  methods: {
    updateTimer() {
      if (this.time > 0) {
        this.time--;
      } else {
        clearInterval(this.interval);
        this.restCount++;
        this.$q.notify({
          message: "Tempo de descanso concluído!",
          color: "blue",
          position: "center",
        });
        this.isRunning = false;
        this.isPaused = false;
      }
    },
    togglePlayPause() {
      if (!this.isRunning) {
        this.startTimer();
      } else if (this.isPaused) {
        this.resumeTimer();
      } else {
        this.pauseTimer();
      }
    },
    startTimer() {
      this.time = 5; // Reinicia o tempo
      clearInterval(this.interval);
      this.interval = setInterval(this.updateTimer, 1000);
      this.isRunning = true;
      this.isPaused = false;
    },
    resumeTimer() {
      clearInterval(this.interval);
      this.interval = setInterval(this.updateTimer, 1000);
      this.isPaused = false;
    },
    pauseTimer() {
      clearInterval(this.interval);
      this.isPaused = true;
    },
    resetTimer() {
      clearInterval(this.interval);
      this.time = 5;
      this.restCount = 0;
      this.isRunning = false;
      this.isPaused = false;
    },
  },
};
</script>

<style>
.timer-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: "Poppins", sans-serif;
}

.timer-row {
  display: flex;
  align-items: baseline; /* Alinha os dois elementos na mesma linha */
  justify-content: center; /* Centraliza os elementos horizontalmente */
}

#timer {
  font-size: 120px; /* Tamanho grande para o número */
}

#rest-count {
  font-size: 32px; /* Tamanho menor para o contador */
  margin-left: 15px; /* Espaçamento entre o número e o contador */
}

.button-container {
  position: fixed;
  bottom: 20px; /* Posiciona os botões na parte inferior da tela */
  width: 100%;
  display: flex;
  justify-content: space-around; /* Distribui os botões uniformemente */
  padding: 0 20px; /* Pequeno espaçamento lateral */
}

.timer-button {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

body {
  background-color: #1c1c1c; /* Fundo em preto puro */
  color: white; /* Texto padrão em branco */
  font-family: "Poppins", sans-serif;
}
</style>
