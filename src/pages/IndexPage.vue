<template>
  <q-page class="flex flex-center q-pa-md" style="background-color: #1c1c1c;">
    <div class="column items-center justify-center full-width q-gutter-md" style="max-width: 400px">
      <!-- Cronômetro Total -->
      <q-card flat bordered class="full-width q-px-md q-py-sm" style="background-color: #333; color: white;">
        <q-card-section>
          <div class="text-h5 text-bold text-center">Tempo Total</div>

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
      <q-dialog v-model="showSaveConfirmation" class="custom-dialog">
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
          <div class="text-h5 text-bold text-center">Tempo</div>
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
import { useTimerStore } from '../stores/useTimerStore';

export default {
  setup() {
    const timerStore = useTimerStore();
    timerStore.initializeTimerWorker();

    return { ...timerStore };
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
