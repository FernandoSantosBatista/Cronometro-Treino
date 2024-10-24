<template>
  <q-page class="q-pa-md flex flex-column justify-between" style="background-color: #1c1c1c;">
    <!-- Seção do topo: Cronômetro de treino total -->
    <div class="total-time-container">
      <!-- Texto "Tempo Total" acima do cronômetro -->
      <div class="total-time-label">Tempo Total</div>

      <!-- Exibição do Tempo Total -->
      <div class="formatted-total-time">{{ formattedTotalTime }}</div>
      <q-btn
        flat
         round
  dense
  icon="save"
  @click="saveTotalTime"
  size="20px"
  class="total-time-save-btn"
/>
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

    const saveTotalTime = () => {
      localStorage.setItem('totalTime', totalTime.value);
       $q.notify({
        message: "Tempo total salvo com sucesso!",
        color: "positive",
        position: "top",
     });
    };

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
      timerWorker.postMessage({ command: 'resume' });
      timerPaused.value = false;
      timerRunning.value = true;
    };

    const pauseTimer = () => {
      timerWorker.postMessage({ command: 'pause' });
      timerPaused.value = true;
    };

    const resetTimer = () => {
      timerWorker.postMessage({ command: 'reset', selectedTime: selectedTime.value.value });
      timerRunning.value = false;
      timerPaused.value = false;
      timeRemaining.value = 0;

      restCount.value = 0;
    };

    const loadTotalTime = () => {
      const savedTotalTime = localStorage.getItem("totalTime");
      if (savedTotalTime !== null) {
        totalTime.value = parseInt(savedTotalTime);
      }
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
.total-time-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 12px;
}

.total-time-label {
  font-size: 16px;
  color: white;
  margin-right: 8px;
  font-weight: bold;
}

.total-time-save-btn {
  font-size: 20px;
  height: 36px;
  width: 36px;
  color: white;
}

.formatted-total-time {
  font-size: 28px;
  font-weight: bold;
  color: white;
  margin-right: 8px;
}

.central-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #333;
  border-radius: 10px;
  padding: 20px;
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

.q-page {
  background-color: #1c1c1c;
}
</style>
