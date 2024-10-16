<template>
  <q-page padding class="flex flex-center q-pa-md">
    <div class="timer-container text-center">
      <!-- Cronômetro de treino total no topo (00:00:00) -->
      <div class="formatted-total-time">{{ formattedTotalTime }}</div>

      <!-- Seletor para escolher o tempo do cronômetro -->
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
      <div>
        <span id="rest-count"> Séries conluidas x {{ restCount }}</span>
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
    const selectedTime = ref(null); // Tempo selecionado
    const timeRemaining = ref(0); // Tempo restante
    const timerRunning = ref(false); // Indicador se o cronômetro está em execução
    const timerPaused = ref(false); // Indicador se o cronômetro está pausado
    let timer = null;
    const restCount = ref(0); // Contador de ciclos de descanso

    // Novo cronômetro para o topo da tela
    const totalTime = ref(0); // Tempo total de treino
    let totalTimer = null; // Referência do cronômetro total

    const timeOptions = [
      { label: "1 Minuto", value: 60 },
      { label: "2 Minutos", value: 120 },
      { label: "3 Minutos", value: 180 },
      { label: "4 Minutos", value: 240 },
      { label: "5 Minutos", value: 300 },
    ];

    // Computed para formatar o tempo restante no formato 00:00
    const formattedTime = computed(() => {
      const minutes = Math.floor(timeRemaining.value / 60);
      const seconds = timeRemaining.value % 60;
      return `${minutes < 10 ? "0" : ""}${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;
    });

    // Computed para formatar o tempo total de treino no formato 00:00:00
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
      if (selectedTime.value) {
        timeRemaining.value = selectedTime.value.value;
        timerRunning.value = true;
        timerPaused.value = false;

        // Inicia cronômetro do tempo de treino
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
      clearInterval(totalTimer); // Limpa o cronômetro total ao desmontar
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
  margin-bottom: 50px;
  padding: 20px;
  font-family: "Poppins", sans-serif;
}

/* Estilo do cronômetro total */
.formatted-total-time {
  font-size: 28px;
  color: white;
  margin-bottom: 30px;
  font-weight: bold;
  letter-spacing: 1px;
}

/* Seletor de tempo */
.time-selector {
  margin-bottom: 25px;
  width: 250px;
  background-color: #2c2c2c;
}

.time-selector .q-select__control {
  border: 1px solid #bbb;
  border-radius: 8px;
  padding: 10px;
}

.time-selector .q-select__control:hover {
  background-color: #2c2c2c;
}

.q-field__label {
  font-size: 16px;
  color: white;
}

/* Estilo do cronômetro */
#timer {
  font-size: 120px;
  font-weight: bold;
  color: white;
  margin-bottom: 20px;
}

#rest-count {
  font-size: 30px;
  color: #bbb;
  margin-bottom: 30px;
}

/* Botões */
.button-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  margin-top: 30px;
}

.timer-button {
  width: 70px;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid white;
  border-radius: 50%;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.timer-button:hover {
  background-color: white;
  color: #1c1c1c;
  border-color: white;
}

/* Responsividade */
@media (max-width: 600px) {
  #timer {
    font-size: 80px;
  }

  .timer-button {
    width: 55px;
    height: 55px;
  }
}

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
