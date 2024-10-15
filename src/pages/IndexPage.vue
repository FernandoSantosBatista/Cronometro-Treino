<template>
  <q-page padding class="flex flex-center q-pa-md">
    <div class="timer-container text-center">
      <!-- Seletor para escolher o tempo do cronômetro -->
      <q-select
        v-model="selectedTime"
        :options="timeOptions"
        label="Selecione o tempo"
        outlined
        dense
        class="time-selector"
      />

      <div class="timer-row">
        <span id="timer">{{ formattedTime }}</span>
        <span id="rest-count">x {{ restCount }}</span>
      </div>

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
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    });

    const playPauseIcon = computed(() => {
      return timerRunning.value && !timerPaused.value ? "pause" : "play_arrow";
    });

    const startTimer = () => {
      if (selectedTime.value) {
        timeRemaining.value = selectedTime.value.value;
        timerRunning.value = true;
        timerPaused.value = false;

        timer = setInterval(() => {
          if (timeRemaining.value > 0) {
            timeRemaining.value--;
          } else {
            stopTimer();
            restCount.value++;
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
      startTimer();
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

    onBeforeUnmount(() => {
      stopTimer();
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
    };
  },
};
</script>

<style>
/* Layout geral */
.timer-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 90px;
  font-family: "Poppins", sans-serif;
}

.timer-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

/* Estilo do cronômetro */
#timer {
  font-size: 110px;
  font-weight: bold;
  color: white;
}

#rest-count {
  font-size: 32px;
  margin-left: 15px;
  color: #bbb;
}

/* Botões */
.button-container {
  position: fixed;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding: 20px 32px;
}

.timer-button {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid white;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.timer-button:hover {
  background-color: white;
  color: #1c1c1c;
  border-color: white;
}

/* Estilos do seletor de tempo */
.time-selector {
  margin-bottom: 20px;
  width: 200px;
  background-color: #1c1c1c;
  color: white;
}

.time-selector .q-select__control {
  border: 1px solid #bbb;
  border-radius: 5px;
}

.time-selector .q-select__control:hover {
  background-color: #2c2c2c;
}

.time-selector .q-select__menu {
  background-color: #1c1c1c;
  color: white;
}

.q-select__dropdown-icon {
  color: white;
}

.q-field__native,
.q-field__prefix,
.q-field__suffix,
.q-field__input {
  color: white;
}

.q-field__label {
  color: white;
}

/* Responsividade */
@media (max-width: 600px) {
  #timer {
    font-size: 80px;
  }

  .timer-button {
    width: 50px;
    height: 50px;
  }
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
