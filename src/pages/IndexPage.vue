<template>
  <q-page class="q-pa-md flex flex-column justify-between">
    <!-- Seção do topo: Cronômetro de treino total -->
    <div class="total-time-container">
      
      <!-- Texto "Tempo Total" acima do cronômetro -->
      <div class="total-time-label">Tempo Total</div>

      <!-- Botão Salvar Total Timer -->
      <q-btn
        flat
        round
        dense
        icon="save"
        @click="saveTotalTime"
        size="20px"
        class="total-time-save-btn"
      />

      <!-- Exibição do Tempo Total -->
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
      <!-- Botão de reset (funcional) -->
      <q-btn
        outline
        icon="refresh"
        @click="resetTimer"
        rounded
        push
        size="md"
        class="timer-button"
      />

      <!-- Botão de iniciar/pausar -->
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
import { ref, computed, onBeforeUnmount, onMounted } from "vue";
import { useQuasar } from "quasar";

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

    // Computed para formatar o tempo restante e o tempo total
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
        timerWorker.postMessage({ command: 'start', selectedTime: selectedTime.value.value });
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

    const resumeTimer = () => {
      // Retoma o cronômetro no Web Worker
      timerWorker.postMessage({ command: 'resume' });
      timerPaused.value = false;
      timerRunning.value = true;
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

    // Função para salvar o tempo total no localStorage
    const saveTotalTime = () => {
      localStorage.setItem("totalTime", totalTime.value);
      $q.notify({
        message: "Tempo total salvo!",
        color: "positive",
        position: "top",
      });
    };

    // Função para carregar o tempo total salvo no localStorage
    const loadTotalTime = () => {
      const savedTotalTime = localStorage.getItem("totalTime");
      if (savedTotalTime !== null) {
        totalTime.value = parseInt(savedTotalTime);
      }
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

    // Carregar o tempo salvo no mounted
    onMounted(() => {
      loadTotalTime();
    });

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
      saveTotalTime,
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

.total-time-label {
  font-size: 16px;
  color: white;
  margin-right: 8px;
  margin-bottom: 4px;
  font-weight: bold;
  text-align: right;
}

.total-time-save-btn {
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
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.timer-button {
  width: 60px;
  height: 60px;
}
</style>
