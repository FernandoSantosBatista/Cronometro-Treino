<template>
  <q-page class="q-pa-md flex flex-column justify-between">
    <!-- Seção do topo: Cronômetro de treino total -->
    <div class="total-time-container">
      <q-btn
        flat
        round
        dense
        icon="pause"
        @click="resetTotalTime"
        size="20px"
        class="total-time-reset-btn"
      />
      <div class="formatted-total-time">{{ formattedTotalTime }}</div>
    </div>

    <!-- Seção central com seletor de tempo, cronômetro e contador de séries -->
    <div class="central-container">
      <!-- Seletor de tempo -->
      <q-select
        v-model="selectedTime"
        :options="timeOptions"
        label="Selecione o tempo"
        outlined
        dense
        class="time-selector"
      />

      <!-- Cronômetro principal (00:00) -->
      <div class="timer-row">
        <span id="timer">{{ formattedTime }}</span>
      </div>

      <!-- Contador de séries -->
      <div id="rest-count">Séries concluídas: {{ restCount }}</div>
    </div>

    <!-- Seção do rodapé com botões de controle -->
    <div class="button-container">
      <q-btn
        outline
        icon="refresh"
        @click="resetTimer"
        rounded
        push
        size="md"
        class="timer-button"
      />
      <q-btn
        outline
        :icon="playPauseIcon"
        @click="togglePlayPause"
        rounded
        push
        size="md"
        class="timer-button"
      />
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";

export default {
  setup() {
    const $q = useQuasar();
    const selectedTime = ref(null);
    const timeRemaining = ref(0);
    const timerRunning = ref(false);
    const timerPaused = ref(false);
    let timer = null;
    const restCount = ref(0);
    const totalTime = ref(0);
    let totalTimer = null;

    const timeOptions = [
      { label: "1 Minuto", value: 60 },
      { label: "2 Minutos", value: 120 },
      { label: "3 Minutos", value: 180 },
      { label: "4 Minutos", value: 240 },
      { label: "5 Minutos", value: 300 },
    ];

    const formattedTime = computed(() => {
      const minutes = Math.floor(timeRemaining.value / 60);
      const seconds = timeRemaining.value % 60;
      return `${minutes < 10 ? "0" : ""}${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;
    });

    const formattedTotalTime = computed(() => {
      const hours = Math.floor(totalTime.value / 3600);
      const minutes = Math.floor((totalTime.value % 3600) / 60);
      const seconds = totalTime.value % 60;
      return `${hours < 10 ? "0" : ""}${hours}:${
        minutes < 10 ? "0" : ""
      }${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    });

    const playPauseIcon = computed(() => {
      return timerRunning.value && !timerPaused.value ? "pause" : "play_arrow";
    });

    const startTimer = () => {
      if (!selectedTime.value) {
        $q.notify({
          message: "Selecione o tempo!",
          color: "negative",
          position: "top",
        });
        return; // Não iniciar o timer se o tempo não for selecionado
      }

      if (!timerRunning.value) {
        restCount.value++;

        timeRemaining.value = selectedTime.value.value;
        timerRunning.value = true;
        timerPaused.value = false;

        if (!totalTimer) {
          totalTimer = setInterval(() => {
            totalTime.value++;
          }, 1000);
        }

        timer = setInterval(() => {
          if (timeRemaining.value > 0) {
            timeRemaining.value--;
          } else {
            stopTimer();
            $q.notify({
              message: "Tempo de descanso concluído!",
              color: "primary",
              position: "top",
            });
          }
        }, 1000);
      }
    };

    const togglePlayPause = () => {
      if (!timerRunning.value) {
        startTimer();
      } else if (timerPaused.value) {
        resumeTimer();
      } else {
        pauseTimer();
      }
    };

    const pauseTimer = () => {
      clearInterval(timer);
      timerPaused.value = true;
    };

    const resumeTimer = () => {
      timerRunning.value = true;
      timerPaused.value = false;

      timer = setInterval(() => {
        if (timeRemaining.value > 0) {
          timeRemaining.value--;
        } else {
          stopTimer();
          $q.notify({
            message: "Tempo de descanso concluído!",
            color: "primary",
            position: "top",
          });
        }
      }, 1000);
    };

    const resetTimer = () => {
      clearInterval(timer);
      timerRunning.value = false;
      timerPaused.value = false;
      timeRemaining.value = selectedTime.value ? selectedTime.value.value : 0;
      restCount.value = 0;
    };

    const stopTimer = () => {
      clearInterval(timer);
      timerRunning.value = false;
      timerPaused.value = false;
    };

    const resetTotalTime = () => {
      clearInterval(totalTimer);
      totalTime.value = 0;
      totalTimer = null;
    };

    onBeforeUnmount(() => {
      stopTimer();
      clearInterval(totalTimer);
    });

    return {
      selectedTime,
      timeOptions,
      timeRemaining,
      formattedTime,
      timerRunning,
      timerPaused,
      restCount,
      playPauseIcon,
      togglePlayPause,
      resetTimer,
      startTimer,
      formattedTotalTime,
      resetTotalTime, // Retorna função para resetar o tempo total
    };
  },
};
</script>

<style>
/* Seção do topo (total-time-container) */
.total-time-container {
  width: 100%;
  display: flex;
  justify-content: right;
  padding: 10px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.total-time-reset-btn {
  font-size: 28px;
  height: 28px;
  width: 28px;
}

.formatted-total-time {
  font-size: 28px;
  font-weight: bold;
  color: white;
  margin-right: 8px;
}

/* Seção central (central-container) */
.central-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 80px; /* Adiciona espaço entre a seção central e os botões */
  background-color: #333;
  border-radius: 10px;
}

.time-selector {
  margin-bottom: 20px;
  width: 80%;
}

.timer-row {
  font-size: 80px;
  color: white;
  margin-bottom: 20px;
}

#rest-count {
  font-size: 20px;
  color: white;
  margin-bottom: 20px;
}

/* Seção do rodapé (button-container) */
.button-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding: 20px;
  margin-top: 40px; /* Adiciona mais espaço acima dos botões */
}

.timer-button {
  width: 70px;
  height: 70px;
}

/* Estilo adicional */
.q-field__native,
.q-field__prefix,
.q-field__suffix,
.q-field__input {
  color: white;
}

.q-select__dialog {
  color: white;
  background-color: #1c1c1c;
}

.q-field__label {
  color: white;
}

.q-field__control {
  color: white;
}

body {
  background-color: #1c1c1c;
  color: white;
  font-family: "Poppins", sans-serif;
}
</style>
