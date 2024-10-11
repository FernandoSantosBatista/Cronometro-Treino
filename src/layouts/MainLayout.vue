<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Navbar -->
    <q-header elevated class="custom-navbar">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="menu-btn"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title class="navbar-title">App</q-toolbar-title>
        <div class="version">v {{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <!-- Drawer (menu lateral) -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="custom-drawer"
    >
      <q-list>
        <q-item-label header class="menu-header">Menu</q-item-label>
        <q-item
          v-for="link in linksList"
          :key="link.title"
          clickable
          class="menu-item"
          @click="navigateTo(link.link)"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" class="menu-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="menu-item-title">{{
              link.title
            }}</q-item-label>
            <q-item-label caption class="menu-item-caption">{{
              link.caption
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Página de conteúdo -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

defineOptions({
  name: "MainLayout",
});

const linksList = [
  {
    title: "Treino",
    caption: "cronômetro",
    icon: "hours",
    link: "/",
  },
];

const leftDrawerOpen = ref(false);
const router = useRouter();

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function navigateTo(link) {
  router.push(link);
  leftDrawerOpen.value = false; // Fecha o drawer após a navegação
}
</script>

<style>
/* Estilo para a navbar */
.custom-navbar {
  background-color: #1f1f1f; /* Preto suave */
  color: #f0f0f0; /* Branco acinzentado */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4); /* Sombra para dar destaque */
}

.navbar-title {
  font-size: 22px;
  font-weight: 500;
  color: #fff; /* Branco para maior contraste */
}

.version {
  font-size: 14px;
  color: #aaa; /* Cinza claro */
}

/* Estilo do botão de menu */
.menu-btn {
  color: #f0f0f0;
}

.menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.1); /* Efeito hover translúcido */
}

/* Estilo do Drawer (menu lateral) */
.custom-drawer {
  background-color: #2c2c2c; /* Fundo escuro */
  color: #f0f0f0;
}

.menu-header {
  color: #fff; /* Branco para o cabeçalho do menu */
  font-size: 16px;
  font-weight: 600;
}

/* Estilo dos itens do menu */
.menu-item {
  transition: background-color 0.3s;
}

.menu-item:hover {
  background-color: rgba(
    255,
    255,
    255,
    0.1
  ); /* Efeito hover nos itens do menu */
}

.menu-icon {
  color: #f0f0f0; /* Ícones em branco suave */
}

.menu-item-title {
  font-size: 16px;
  color: #f0f0f0;
}

.menu-item-caption {
  font-size: 14px;
  color: #aaa; /* Legenda em cinza claro */
}
</style>
