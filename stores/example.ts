import { defineStore } from 'pinia'

export const useExampleStore = defineStore('example', {
  state: () => ({
    count: 0,
    message: 'Hello from Pinia!',
  }),

  getters: {
    doubleCount: state => state.count * 2,
    formattedMessage: state => `📱 ${state.message}`,
  },

  actions: {
    increment() {
      this.count++
    },

    decrement() {
      this.count--
    },

    setMessage(newMessage: string) {
      this.message = newMessage
    },

    async fetchData() {
      // Example async action
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.message = 'Data fetched successfully!'
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    },
  },
})
