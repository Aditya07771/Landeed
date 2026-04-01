/** Browser stub for @react-native-async-storage/async-storage (MetaMask SDK optional RN dep). */
const memory = new Map()
module.exports = {
  default: {
    getItem: async (key) => memory.get(key) ?? null,
    setItem: async (key, value) => {
      memory.set(key, value)
    },
    removeItem: async (key) => {
      memory.delete(key)
    },
    clear: async () => {
      memory.clear()
    },
  },
}
