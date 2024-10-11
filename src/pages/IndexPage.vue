<template>
  <q-page padding class="flex flex-center q-pa-md">
    <div class="timer-container text-center q-pa-lg q-mt-md q-mb-md">
      <span id="timer" class="text-h1 q-mb-md text-center">
        {{ formattedTime }}
      </span>
      <span id="rest-count" class="text-subtitle1 text-center q-mt-md">
        x {{ restCount }}
      </span>

      <div class="q-gutter-md q-mt-md row justify-center">
        <q-btn
          outline
          icon="play_arrow"
          @click="startTimer"
          color="white"
          rounded
          push
          size="md"
          class="timer-button"
        />
        <q-btn
          outline
          icon="pause"
          @click="pauseTimer"
          color="white"
          rounded
          push
          size="md"
          class="timer-button"
        />
        <q-btn
          outline
          icon="refresh"
          @click="resetTimer"
          color="white"
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
      time: 5, // 60 segundos de descanso
      restCount: 0, // Contador de descansos
      interval: null,
      isRunning: false, // Verifica se o cronômetro está rodando
      isPaused: false, // Verifica se o cronômetro está pausado
    };
  },
  computed: {
    formattedTime() {
      return this.time < 10 ? "0" + this.time : this.time;
    },
  },
  methods: {
    updateTimer() {
      if (this.time > 0) {
        this.time--;
      } else {
        clearInterval(this.interval);
        this.restCount++; // Incrementa o contador de descansos
        this.$q.notify({
          message: "Tempo de descanso concluído!",
          color: "blue",
          position: "center",
        });
        this.isRunning = false; // Permite que o cronômetro seja reiniciado corretamente
        this.isPaused = false; // Sai do estado pausado
      }
    },
    startTimer() {
      if (!this.isRunning && !this.isPaused) {
        this.time = 5; // Reinicia o tempo para 60 segundos a cada novo início
        clearInterval(this.interval); // Garante que não haverá múltiplos timers em execução
        this.interval = setInterval(this.updateTimer, 1000);
        this.isRunning = true;
      } else if (this.isPaused) {
        clearInterval(this.interval);
        this.interval = setInterval(this.updateTimer, 1000);
        this.isPaused = false;
      }
    },
    pauseTimer() {
      if (this.isRunning && !this.isPaused) {
        clearInterval(this.interval);
        this.isPaused = true;
      }
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
  background: rgba(255, 255, 255, 0.05); /* Fundo translúcido com tom leve */
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5); /* Sombra suave em preto */
  padding: 60px; /* Ajuste no padding */
}

.timer-button {
  width: 60px; /* Aumentado para tamanho médio */
  height: 60px; /* Aumentado para tamanho médio */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #333; /* Botão em tom de cinza escuro */
  color: white;
  border: none;
  transition: background-color 0.3s ease;
}

.timer-button:hover {
  background-color: #555; /* Tom de cinza mais claro ao passar o mouse */
}

.timer-button:active {
  background-color: #222; /* Tom mais escuro ao clicar */
}

.text-h1 {
  font-size: 130px; /* Aumentei o tamanho do número */
  color: #f0f0f0; /* Branco acinzentado para contraste suave */
  letter-spacing: 2px;
}

.text-subtitle1 {
  font-size: 24px; /* Aumentei o tamanho do subtítulo */
  color: #aaa; /* Cinza médio para o contador de descansos */
}

body {
  background-color: #1c1c1c; /* Fundo em preto puro */
  color: white; /* Texto padrão em branco */
  font-family: "Poppins", sans-serif;
}

.q-page {
  background: #2c2c2c; /* Fundo da página em cinza escuro */
}

.poppins-thin {
  font-style: normal;
}
</style>
