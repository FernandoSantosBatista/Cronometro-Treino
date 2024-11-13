<template>
  <q-page class="q-pa-md flex flex-column justify-between">
    <div class="total-time-container">
      <q-btn
        flat
        round
        dense
        icon="arrow_downward"
        @click="saveTotalTime"
        size="20px"
        class="total-time-save-btn"
      />

      <q-btn
        v-if="showResetTotal"
        flat
        round
        dense
        icon="pause"
        @click="showConfirmation = true"
        size="20px"
        class="total-time-reset-btn"
      />

      <q-btn
        v-if="!showResetTotal"
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

    <!-- Diálogo de confirmação para resetar o tempo total -->
    <q-dialog v-model="showConfirmation" class="custom-dialog">
      <q-card class="custom-card">
        <q-card-section>
          <div class="text-h6">Confirmar Reset</div>
          <div>Você tem certeza que deseja resetar o cronômetro total?</div>
        </q-card-section>
        <q-card-actions align="right" class="custom-card-actions">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            flat
            label="Confirmar"
            color="negative"
            @click="confirmResetTotalTime"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo de confirmação para salvar o tempo total -->
    <q-dialog v-model="showSaveConfirmation" class="custom-dialog">
      <q-card class="custom-card">
        <q-card-section>
          <div class="text-h6">Confirmar Salvar</div>
          <div>Você realmente quer salvar o tempo total?</div>
        </q-card-section>
        <q-card-actions align="right" class="custom-card-actions">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            flat
            label="Salvar"
            color="positive"
            @click="confirmSaveTotalTime"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="central-container">
      <q-select
        v-model="selectedTime"
        :options="timeOptions"
        label="Selecione o tempo de descanso"
        outlined
        dense
        class="time-selector"
      />
      <div class="timer-row">
        <span id="timer">{{ formattedTime }}</span>
      </div>
      <div id="rest-count">Séries concluídas: {{ restCount }}</div>
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
  </q-page>
</template>

<script>
import { ref, computed, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";
import { useTimerStore } from "../stores/useTimerStore";

// Importa o Web Worker
const timerWorker = new Worker(
  new URL("../../timerWorker.js", import.meta.url)
);

export default {
  setup() {
    const $q = useQuasar();
    const selectedTime = ref(null);
    const timeRemaining = ref(0);
    const timerRunning = ref(false);
    const timerPaused = ref(false);
    const restCount = ref(0);
    const totalTime = ref(0);
    const showResetTotal = ref(false);
    const showConfirmation = ref(false); // Controle para o diálogo de confirmação do reset
    const showSaveConfirmation = ref(false); // Controle para o diálogo de confirmação do salvamento
    const timerStore = useTimerStore();

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
          message: "Selecione o tempo de descanso!",
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

        // Inicia o cronômetro de descanso no Web Worker
        timerWorker.postMessage({
          command: "start",
          selectedTime: selectedTime.value.value,
        });
      }
    };

    const saveTotalTime = () => {
      // Exibe o diálogo de confirmação para salvar o tempo total
      showSaveConfirmation.value = true;
    };

   const confirmSaveTotalTime = () => {
    let savedTimes = JSON.parse(localStorage.getItem("savedTimes")) || [];
    const id = Date.now();

    const totalSeconds = totalTime.value;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

   const now = new Date();
   const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(
    now.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${now.getFullYear()} ${now
    .getHours()
    .toString()
    .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;

  const timeData = {
    id: id,
    date: formattedDate,
    time: formattedTime,
  };

  // Adiciona o novo tempo ao início do array
  savedTimes.unshift(timeData);
  localStorage.setItem("savedTimes", JSON.stringify(savedTimes));

  $q.notify({
    message: "Tempo total salvo com sucesso!",
    color: "positive",
    position: "top",
  });

  // Fecha o diálogo após salvar
  showSaveConfirmation.value = false;
};
    

    const getSavedTimes = () => {
      let savedTimes = JSON.parse(localStorage.getItem("savedTimes")) || [];
      console.log(savedTimes);
      return savedTimes;
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

    const resumeTimer = () => {
      timerWorker.postMessage({ command: "resume" });
      timerPaused.value = false;
      timerRunning.value = true;
    };

    const pauseTimer = () => {
      timerWorker.postMessage({ command: "pause" });
      timerPaused.value = true;
    };

    const resetTimer = () => {
      timerWorker.postMessage({
        command: "reset",
        selectedTime: selectedTime.value.value,
      });
      timerRunning.value = false;
      timerPaused.value = false;
      timeRemaining.value = 0;
      restCount.value = 0;
    };

    const startTotalTimer = () => {
      timerWorker.postMessage({ command: "startTotal" });
      showResetTotal.value = true;
    };

    // Exibe a confirmação para resetar o Total Timer
    const requestTotalTimeReset = () => {
      showConfirmation.value = true;
    };

    // Confirma o reset do Total Timer
    const confirmResetTotalTime = () => {
      resetTotalTime();
      showConfirmation.value = false;
    };

    const resetTotalTime = () => {
      timerWorker.postMessage({ command: "resetTotal" });
      showResetTotal.value = false;
      $q.notify({
        message: "Cronômetro total foi resetado!",
        color: "negative",
      });
    };

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
      timerWorker.postMessage({ command: "resetTotal" });
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
      showResetTotal,
      showConfirmation,
      showSaveConfirmation, // Adiciona o controle para o diálogo de salvamento
      saveTotalTime,
      confirmSaveTotalTime, // Adiciona a função para confirmar o salvamento
      confirmResetTotalTime,
      requestTotalTimeReset,
      timerStore,
    };
  },
};
</script>

<style>
/* Estilos personalizados para o diálogo */
.custom-dialog {
  backdrop-filter: blur(5px); /* Efeito de desfoque no fundo */
}

.custom-card {
  background-color: #333; /* Cor de fundo do cartão */
  color: white; /* Cor do texto dentro do cartão */
}

.custom-card .q-card-section {
  border-bottom: 1px solid #444; /* Borda para separar o cabeçalho do corpo */
}

.custom-card-actions {
  background-color: #444; /* Cor de fundo das ações do cartão */
}
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

.total-time-save-btn {
  font-size: 28px;
  height: 28px;
  width: 28px;
  margin-left: 10px;
}

.total-time-label {
  font-size: 16px;
  color: white;
  margin-right: 8px;
  margin-bottom: 4px;
  font-weight: bold;
  text-align: right;
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

/* Estilos personalizados para o diálogo */
.custom-dialog {
  backdrop-filter: blur(5px); /* Efeito de desfoque no fundo */
}

.custom-card {
  background-color: #333; /* Cor de fundo do cartão */
  color: white; /* Cor do texto dentro do cartão */
}

.custom-card .q-card-section {
  border-bottom: 1px solid #444; /* Borda para separar o cabeçalho do corpo */
}

.custom-card-actions {
  background-color: #444; /* Cor de fundo das ações do cartão */
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
