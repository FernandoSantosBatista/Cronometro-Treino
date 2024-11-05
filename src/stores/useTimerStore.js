// /src/stores/useTimerStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useTimerStore = defineStore("timer", () => {
  const timeRemaining = ref(0);
  const totalTime = ref(0);
  const timerRunning = ref(false);
  const timerPaused = ref(false);
  const restCount = ref(0);

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

  return {
    timeRemaining,
    totalTime,
    timerRunning,
    timerPaused,
    restCount,
    formattedTime,
    formattedTotalTime,
  };
});
