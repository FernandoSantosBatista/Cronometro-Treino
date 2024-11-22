<template>
  <q-page class="flex flex-center">
    <div class="container text-center">
      <!-- Título -->
      <h1>Treinamento</h1>

      <!-- Cronômetro -->
      <div class="q-my-md text-h4">
        {{ timerStore.formattedTotalTime }}
      </div>

      <!-- Botões -->
      <div class="q-mt-md">
        <!-- Botão Salvar -->
        <q-btn
          flat
          round
          dense
          icon="save"
          color="positive"
          @click="timerStore.saveTotalTime"
          label="Salvar"
          class="q-mr-xs"
        />

        <!-- Botão Pausar -->
        <q-btn
          v-if="timerStore.showResetTotal"
          flat
          round
          dense
          icon="pause"
          color="negative"
          @click="timerStore.requestTotalTimeReset"
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
          @click="timerStore.startTotalTimer"
          label="Iniciar"
        />
      </div>

      <!-- Diálogo de Confirmação de Reset -->
      <q-dialog v-model="timerStore.showConfirmation">
        <q-card>
          <q-card-section>
            <div class="text-h6">Tem certeza que deseja pausar?</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" @click="timerStore.cancelReset" />
            <q-btn flat label="Confirmar" color="negative" @click="timerStore.resetTotalTime" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Diálogo de Confirmação de Salvar -->
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
    // Referência da store
    const timerStore = useTimerStore();

    return {
      timerStore, // Adiciona a store para uso no template
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 400px;
  margin: auto;
}
</style>
