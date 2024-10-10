<template>
  <q-page
    padding
    class="flex flex-center q-pa-md"
    style="background: linear-gradient(135deg, #004e92, #000428)"
  >
    <div class="timer-container text-center q-pa-xl q-mt-md q-mb-md">
      <span id="timer" class="text-h1 q-mb-md text-bold text-center">
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
          color="primary"
          rounded
          push
          size="lg"
          class="timer-button"
        />
        <q-btn
          outline
          icon="pause"
          @click="pauseTimer"
          color="primary"
          rounded
          push
          size="lg"
          class="timer-button"
        />
        <q-btn
          outline
          icon="refresh"
          @click="resetTimer"
          color="primary"
          rounded
          push
          size="lg"
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
          color: "positive",
          position: "top",
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.timer-button {
  width: 70px;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.text-accent {
  color: #00d4ff;
}

.text-h1 {
  font-size: 150px;
  color: #00d4ff;
}

.text-subtitle1 {
  font-size: 28px;
  color: #00d4ff;
}
</style>
