import { defineStore } from 'pinia';

export const useTimerStore = defineStore('timerStore', {
  state: () => ({
    selectedTime: null,
    timeRemaining: 0,
    timerRunning: false,
    timerPaused: false,
    restCount: 0,
    totalTime: 0,
    showResetTotal: false,
    showConfirmation: false,
    showSaveConfirmation: false,
    timerWorker: null, // Para gerenciar o Web Worker
    timeOptions: [
      { label: "1 Minuto", value: 60 },
      { label: "2 Minutos", value: 120 },
      { label: "3 Minutos", value: 180 },
      { label: "4 Minutos", value: 240 },
      { label: "5 Minutos", value: 300 },
    ],
  }),

  getters: {
    formattedTime(state) {
      const minutes = Math.floor(state.timeRemaining / 60);
      const seconds = state.timeRemaining % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    },

    formattedTotalTime(state) {
      const hours = Math.floor(state.totalTime / 3600);
      const minutes = Math.floor((state.totalTime % 3600) / 60);
      const seconds = state.totalTime % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    playPauseIcon(state) {
      return state.timerRunning && !state.timerPaused ? "pause" : "play_arrow";
    },
  },

  actions: {
    initializeTimerWorker() {
      this.timerWorker = new Worker(new URL('../../timerWorker.js', import.meta.url));

      this.timerWorker.onmessage = (e) => {
        if (e.data.timeRemaining !== undefined) {
          this.timeRemaining = e.data.timeRemaining;

          if (this.timeRemaining <= 0) {
            this.timerRunning = false;
          }
        }

        if (e.data.totalTime !== undefined) {
          this.totalTime = e.data.totalTime;
        }
      };
    },

    startTimer() {
      if (!this.selectedTime) {
        throw new Error("Selecione o tempo de descanso!");
      }

      if (!this.timerRunning) {
        this.restCount++;
        this.timeRemaining = this.selectedTime.value;
        this.timerRunning = true;
        this.timerPaused = false;

        this.timerWorker.postMessage({
          command: "start",
          selectedTime: this.selectedTime.value,
        });
      }
    },

    pauseTimer() {
      this.timerWorker.postMessage({ command: "pause" });
      this.timerPaused = true;
    },

    resumeTimer() {
      this.timerWorker.postMessage({ command: "resume" });
      this.timerPaused = false;
    },

    resetTimer() {
      this.timerWorker.postMessage({
        command: "reset",
        selectedTime: this.selectedTime.value,
      });
      this.timerRunning = false;
      this.timerPaused = false;
      this.timeRemaining = 0;
      this.restCount = 0;
    },

    startTotalTimer() {
      this.timerWorker.postMessage({ command: "startTotal" });
      this.showResetTotal = true;
    },

    requestTotalTimeReset() {
      this.showConfirmation = true;
    },

    confirmResetTotalTime() {
      this.resetTotalTime();
      this.showConfirmation = false;
    },

    resetTotalTime() {
      this.timerWorker.postMessage({ command: "resetTotal" });
      this.showResetTotal = false;
    },

    saveTotalTime() {
      this.showSaveConfirmation = true;
    },

    confirmSaveTotalTime() {
      let savedTimes = JSON.parse(localStorage.getItem("savedTimes")) || [];
      const id = Date.now();

      const totalSeconds = this.totalTime;
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

      savedTimes.unshift(timeData);
      localStorage.setItem("savedTimes", JSON.stringify(savedTimes));

      this.showSaveConfirmation = false;
    },
  },
});
