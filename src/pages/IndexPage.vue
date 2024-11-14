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
  /* Geral */
body {
  background-color: #f5f5f5; /* Cor neutra para o fundo */
  color: #333; /* Texto em um tom de cinza para boa legibilidade */
  font-family: "Poppins", sans-serif;
  font-size: 16px;
  margin: 0;
  padding: 0;
}

/* Contêiner de tempo total (topo) */
.total-time-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 16px;
  background-color: #fff; /* Fundo branco para destacar */
  border-bottom: 1px solid #ddd; /* Linha de separação suave */
}

.total-time-save-btn,
.total-time-reset-btn,
.total-time-start-btn {
  font-size: 24px;
  color: #333;
  margin-left: 12px;
}

.formatted-total-time {
  font-size: 18px;
  font-weight: 500;
  color: #555; /* Cor suave para o tempo */
}

/* Contêiner central (seletor e cronômetro) */
.central-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
  margin: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* Sombra leve */
}

.time-selector {
  margin-bottom: 20px;
  width: 100%;
}

.timer-row {
  font-size: 64px;
  font-weight: 600;
  color: #333;
  margin: 16px 0;
}

#rest-count {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

/* Contêiner de botões (rodapé) */
.button-container {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background-color: #fff;
  border-top: 1px solid #ddd;
}

.timer-button {
  width: 56px;
  height: 56px;
  font-size: 24px;
  color: #333;
  border-radius: 50%;
  background-color: transparent;
  border: 1px solid #ddd;
  transition: background-color 0.3s;
}

.timer-button:hover {
  background-color: #f0f0f0;
}

/* Estilos para diálogos */
.custom-dialog {
  backdrop-filter: blur(3px); /* Desfoque suave no fundo */
}

.custom-card {
  background-color: #fff;
  color: #333;
}

.custom-card .q-card-section {
  border-bottom: 1px solid #eee;
}

.custom-card-actions {
  background-color: #f5f5f5;
}

/* Estilos adicionais para campos */
.q-field__native,
.q-field__prefix,
.q-field__suffix,
.q-field__input {
  color: #333;
}

.q-field__label {
  color: #777;
}

.q-select__dialog,
.q-field__control {
  color: #333;
  background-color: #fff;
}
</style>
