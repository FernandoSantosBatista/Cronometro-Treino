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
      <!-- Botão de início do Total Timer -->
      <q-btn
        flat
        round
        dense
        icon="play_arrow"
        @click="startTotalTimer"
        size="20px"
        class="total-time-start-btn"
      />
      <div class="formatted-total-time">{{ formattedTotalTime }}</div>
    </div>

    <!-- Seção central com seletor de tempo, cronômetro e contador de séries -->
    <div class="central-container">
      <!-- Seletor de tempo -->
      <q-select
        v-model="selectedTime"
        :options="timeOptions"
        label="Selecione o tempo de descanso"
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

// Importa o Web Worker
const timerWorker = new Worker(new URL('../../timerWorker.js', import.meta.url));

export default {
  setup() {
    const $q = useQuasar();
    const selectedTime = ref(null);
    const timeRemaining = ref(0);
    const timerRunning = ref(false);
    const timerPaused = ref(false);
    const restCount = ref(0);
    const totalTime = ref(0);

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
      return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    });

    const formattedTotalTime = computed(() => {
      const hours = Math.floor(totalTime.value / 3600);
      const minutes = Math.floor((totalTime.value % 3600) / 60);
      const seconds = totalTime.value % 60;
      return `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    });

    const playPauseIcon = computed(() => {
      return timerRunning.value && !timerPaused.value ? "pause" : "play_arrow";
    });

    const startTimer = () => {
  if (!selectedTime.value) {
    $q.notify({
      message: "Selecione o tempo de descanso !",
      color: "negative",
      position: "top",
    });
    return;
  }

  if (!timerRunning.value) {
    restCount.value++;
    timeRemaining.value = selectedTime.value.value;
    timerRunning.value = true;
    timerPaused.value = false;

    // Inicia o cronômetro no Web Worker
    timerWorker.postMessage({ command: 'start', selectedTime: selectedTime.value.value });

    // Inicia o Total Timer se não estiver rodando
    timerWorker.postMessage({ command: 'startTotal' });
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
      // Pausa o cronômetro no Web Worker
      timerWorker.postMessage({ command: 'pause' });
      timerPaused.value = true;
    };

    const resetTimer = () => {
  // Reseta apenas o cronômetro principal, sem tocar no totalTime
       timerWorker.postMessage({ command: 'reset', selectedTime: selectedTime.value.value });
       timerRunning.value = false;
       timerPaused.value = false;
       timeRemaining.value = 0; // Reseta o tempo restante

  // Reseta o contador de séries concluídas
     restCount.value = 0;
  };

    const startTotalTimer = () => {
     timerWorker.postMessage({ command: 'startTotal' });
  };


    const resetTotalTime = () => {
     timerWorker.postMessage({ command: 'resetTotal' });
  };


    // Recebe mensagens do Web Worker
    timerWorker.onmessage = function (e) {
      if (e.data.timeRemaining !== undefined) {
        timeRemaining.value = e.data.timeRemaining;

        if (timeRemaining.value <= 0) {
          timerRunning.value = false;
          $q.notify({
            message: "Tempo de descanso concluído!",
            color: "primary",
            position: "top",
          });
        }
      }

      if (e.data.totalTime !== undefined) {
        totalTime.value = e.data.totalTime;
      }
    };

    onBeforeUnmount(() => {
      timerWorker.postMessage({ command: 'resetTotal' });
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
      resetTotalTime,
      startTotalTimer,
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
