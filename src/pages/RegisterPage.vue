<template>
  <q-page class="q-pa-md">
    <div class="q-pa-md">
      <q-card class="q-mb-md">
        <q-card-section class="bg-dark text-white">
          <div class="text-h5 text-center">Tempo de Treino</div>
        </q-card-section>
      </q-card>

      <q-table
        :rows="savedTimes"
        :columns="columns"
        row-key="id"
        flat
        bordered
        separator="cell"
        dark
      >
        <!-- Coluna personalizada para o botão de exclusão -->
        <template v-slot:body-cell-action="props">
          <q-td :props="props" align="center">
            <q-btn
              color="negative"
              icon="delete"
              @click="confirmDelete(props.row.id)"
              flat
            />
          </q-td>
        </template>
      </q-table>

      <!-- Diálogo de confirmação com estilização personalizada -->
      <q-dialog v-model="isDeleteDialogOpen" class="custom-dialog">
        <q-card class="custom-card">
          <q-card-section>
            <div class="text-h6">Confirmar Exclusão</div>
            <p>Tem certeza de que deseja excluir este tempo de treino?</p>
          </q-card-section>

          <q-card-actions align="right" class="custom-card-actions">
            <q-btn flat label="Cancelar" color="primary" @click="isDeleteDialogOpen = false" />
            <q-btn flat label="Excluir" color="negative" @click="deleteConfirmed" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const savedTimes = ref([]);
    const isDeleteDialogOpen = ref(false);
    const deleteId = ref(null);

    const columns = [
      {
        name: 'date',
        label: 'Data/Hora',
        align: 'left',
        field: 'date',
      },
      {
        name: 'time',
        label: 'Tempo Total',
        align: 'left',
        field: 'time',
      },
      {
        name: 'action',
        label: 'Ações',
        align: 'center',
        field: 'action',
      },
    ];

   const getSavedTimes = () => {
     const times = JSON.parse(localStorage.getItem('savedTimes')) || [];
     // Ordena os tempos do mais novo para o mais antigo
      return times.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

    const confirmDelete = (id) => {
      deleteId.value = id;
      isDeleteDialogOpen.value = true;
    };

    const deleteConfirmed = () => {
      deleteTime(deleteId.value);
      isDeleteDialogOpen.value = false;
    };

    const deleteTime = (id) => {
      savedTimes.value = savedTimes.value.filter(time => time.id !== id);
      localStorage.setItem('savedTimes', JSON.stringify(savedTimes.value));
    };

    onMounted(() => {
      savedTimes.value = getSavedTimes();
    });

    return {
      savedTimes,
      columns,
      confirmDelete,
      deleteConfirmed,
      isDeleteDialogOpen,
    };
  },
};
</script>

<style scoped>
.q-page {
  background-color: #333;
  color: white;
  font-family: "Poppins", sans-serif;
}

.q-table .q-td {
  color: white;
}

.text-bold {
  font-weight: bold;
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
</style>
