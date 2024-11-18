<template>
  <q-page class="flex flex-center q-pa-md" style="background-color: #1c1c1c;">
    <div class="column items-center justify-center full-width q-gutter-md" style="max-width: 400px">
      <!-- Cronômetro Total -->
      <q-card flat bordered class="full-width q-px-md q-py-sm" style="background-color: #333; color: white;">
        <q-card-section>
          <div class="text-h5 text-bold text-center">Cronômetro Total</div>

          <div class="row justify-center q-gutter-sm q-mt-sm">
  <!-- Botão Salvar -->
  <q-btn
    flat
    round
    dense
    icon="save"
    color="positive"
    @click="saveTotalTime"
    label="Salvar"
    class="q-mr-xs"
  />

  <!-- Botão Pausar -->
  <q-btn
    v-if="showResetTotal"
    flat
    round
    dense
    icon="pause"
    color="negative"
    @click="requestTotalTimeReset"
    label="Pausar"
  />

  <!-- Botão Iniciar -->
  <q-btn
    v-else
    flat
    round
    dense
    icon="play_arrow"
    color="positive"
    @click="startTotalTimer"
    label="Iniciar"
  />
</div>

          
          <div class="text-center q-mt-md text-h4">{{ formattedTotalTime }}</div>
        </q-card-section>
      </q-card>

      <q-dialog v-model="showConfirmation" class="custom-dialog">
  <q-card style="background-color: #444; color: white;">
    <q-card-section>
      <div class="text-h6">Resetar tempo total?</div>
      <div class="q-mt-sm">Deseja realmente resetar o cronômetro total?</div>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat label="Cancelar" color="negative" v-close-popup />
      <q-btn flat label="Confirmar" color="positive" @click="confirmResetTotalTime" />
    </q-card-actions>
  </q-card>
</q-dialog>

      <!-- Modal de Confirmação -->
      <q-dialog v-model="showSaveConfirmation">
        <q-card style="background-color: #444; color: white;">
          <q-card-section>
            <div class="text-h6">Salvar tempo total?</div>
            <p class="text-body-2 q-mt-xs">Deseja salvar o cronômetro total atual?</p>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="negative" v-close-popup />
            <q-btn flat label="Salvar" color="positive" @click="confirmSaveTotalTime" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Cronômetro de Descanso -->
      <q-card flat bordered class="full-width q-px-md q-py-sm" style="background-color: #333; color: white;">
        <q-card-section>
          <div class="text-h5 text-bold text-center">Cronômetro de Descanso</div>
          <q-select
            v-model="selectedTime"
            :options="timeOptions"
            label="Selecione o tempo de descanso"
            outlined
            dense
            style="background-color: #444; color: white;"
            input-style="color: white;"
            class="q-mt-md"
          />
          <div class="text-center q-mt-md text-h4">{{ formattedTime }}</div>
          <div class="text-center q-mt-sm text-body-2">
            Séries concluídas: <strong>{{ restCount }}</strong>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-gutter-sm">
          <q-btn outline icon="refresh" color="primary" @click="resetTimer" rounded label="Resetar" />
          <q-btn outline :icon="playPauseIcon" color="positive" @click="togglePlayPause" rounded label="Iniciar/Pausar" />
        </q-card-actions>
      </q-card>
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
  @media (max-width: 600px) {
  .container {
    max-width: 90%;
  }
  }

  .q-btn:hover {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  }

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

</style>
