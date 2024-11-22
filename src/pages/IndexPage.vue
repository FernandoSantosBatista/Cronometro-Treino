<template>
  <q-page class="q-pa-md flex flex-center">
    <div class="container text-center">
      <!-- Título -->
      <h1 class="text-h5 text-bold">Treinamento</h1>

      <!-- Exibição do cronômetro -->
      <div class="q-my-md">
        <span class="text-h4">{{ timerStore.formattedTotalTime }}</span>
      </div>

      <!-- Botões de controle -->
      <div class="row justify-center q-my-md">
        <!-- Botão Salvar -->
        <q-btn
          flat
          round
          dense
          icon="save"
          color="positive"
          label="Salvar"
          @click="timerStore.saveTotalTime"
        />

        <!-- Botão Iniciar -->
        <q-btn
          v-if="!timerStore.isRunning"
          flat
          round
          dense
          icon="play_arrow"
          color="primary"
          label="Iniciar"
          class="q-ml-sm"
          @click="timerStore.startTotalTimer"
        />

        <!-- Botão Pausar -->
        <q-btn
          v-else
          flat
          round
          dense
          icon="pause"
          color="negative"
          label="Pausar"
          class="q-ml-sm"
          @click="timerStore.requestTotalTimeReset"
        />
      </div>

      <!-- Lista de tempos salvos -->
      <q-list bordered separator class="q-my-md">
        <q-item v-for="(time, index) in timerStore.savedTimes" :key="index">
          <q-item-section>
            {{ time }}
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Diálogo de confirmação de reset -->
      <q-dialog v-model="timerStore.showConfirmation">
        <q-card>
          <q-card-section>
            <div class="text-h6">Deseja pausar o cronômetro?</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" @click="timerStore.cancelReset" />
            <q-btn flat label="Confirmar" color="negative" @click="timerStore.resetTotalTime" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Diálogo de confirmação de salvar -->
      <q-dialog v-model="timerStore.showSaveConfirmation">
        <q-card>
          <q-card-section>
            <div class="text-h6">Tempo salvo com sucesso!</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="OK" color="positive" @click="timerStore.closeSaveConfirmation" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { useTimerStore } from "../stores/useTimerStore";

export default {
  setup() {
    const timerStore = useTimerStore();

    return {
      timerStore,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 500px;
  margin: auto;
}
</style>
