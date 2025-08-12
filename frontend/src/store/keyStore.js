import { create } from "zustand";
import axios from "axios";
import { handleError, handleSuccess } from "../utils/errorHandler.js";

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/keys`
  : import.meta.env.MODE === "development"
    ? "http://localhost:8000/api/keys"
    : "/api/keys";

// Mock data for development - replace with real API calls
const mockKeys = [
  {
    id: "key-001",
    keyNumber: "101",
    keyName: "Computer Lab 1",
    location: "Block A - Floor 1",
    status: "available",
    takenBy: null,
    takenAt: null,
    returnedAt: null,
    frequentlyUsed: true
  },
  {
    id: "key-002",
    keyNumber: "102",
    keyName: "Computer Lab 2",
    location: "Block A - Floor 1",
    status: "unavailable",
    takenBy: { id: "user-1", name: "Dr. Smith", email: "smith@college.edu" },
    takenAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    returnedAt: null,
    frequentlyUsed: true
  },
  {
    id: "key-003",
    keyNumber: "201",
    keyName: "Physics Lab",
    location: "Block B - Floor 2",
    status: "available",
    takenBy: null,
    takenAt: null,
    returnedAt: null,
    frequentlyUsed: false
  },
  {
    id: "key-004",
    keyNumber: "301",
    keyName: "Chemistry Lab",
    location: "Block C - Floor 3",
    status: "unavailable",
    takenBy: { id: "user-2", name: "Prof. Johnson", email: "johnson@college.edu" },
    takenAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    returnedAt: null,
    frequentlyUsed: true
  },
  {
    id: "key-005",
    keyNumber: "401",
    keyName: "Library Study Room 1",
    location: "Library - Floor 4",
    status: "available",
    takenBy: null,
    takenAt: null,
    returnedAt: null,
    frequentlyUsed: false
  }
];

export const useKeyStore = create((set, get) => ({
  keys: mockKeys,
  isLoading: false,
  error: null,
  searchQuery: "",
  activeQRRequest: null,

  // Get available keys
  getAvailableKeys: () => {
    const { keys } = get();
    return keys.filter(key => key.status === "available");
  },

  // Get unavailable keys
  getUnavailableKeys: () => {
    const { keys } = get();
    return keys.filter(key => key.status === "unavailable");
  },

  // Get keys taken by current user
  getTakenKeys: (userId) => {
    const { keys } = get();
    return keys.filter(key => key.status === "unavailable" && key.takenBy?.id === userId);
  },

  // Get frequently used keys
  getFrequentlyUsedKeys: () => {
    const { keys } = get();
    return keys.filter(key => key.frequentlyUsed);
  },

  // Search keys
  searchKeys: (query) => {
    const { keys } = get();
    if (!query.trim()) return keys;

    const searchTerm = query.toLowerCase();
    return keys.filter(key =>
      key.keyName.toLowerCase().includes(searchTerm) ||
      key.keyNumber.toLowerCase().includes(searchTerm) ||
      key.location.toLowerCase().includes(searchTerm)
    );
  },

  // Set search query
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  // Generate QR code for key request
  generateKeyRequestQR: async (keyId, userId) => {
    set({ isLoading: true, error: null });

    try {
      const qrData = {
        type: "KEY_REQUEST",
        keyId,
        userId,
        timestamp: new Date().toISOString(),
        requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      set({
        activeQRRequest: qrData,
        isLoading: false
      });

      return qrData;
    } catch (error) {
      const errorMessage = handleError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Generate QR code for key return
  generateKeyReturnQR: async (keyId, userId) => {
    set({ isLoading: true, error: null });

    try {
      const qrData = {
        type: "KEY_RETURN",
        keyId,
        userId,
        timestamp: new Date().toISOString(),
        returnId: `ret-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      return qrData;
    } catch (error) {
      const errorMessage = handleError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Process QR scan (for security users)
  processQRScan: async (qrData) => {
    set({ isLoading: true, error: null });

    try {
      const { keys } = get();
      const key = keys.find(k => k.id === qrData.keyId);

      if (!key) {
        throw new Error("Key not found");
      }

      let updatedKeys;
      let message;

      if (qrData.type === "KEY_REQUEST") {
        if (key.status !== "available") {
          throw new Error("Key is not available");
        }

        updatedKeys = keys.map(k =>
          k.id === qrData.keyId
            ? {
                ...k,
                status: "unavailable",
                takenBy: { id: qrData.userId, name: "Faculty User"}, // In real app, get user details
                takenAt: new Date().toISOString(),
                returnedAt: null
              }
            : k
        );
        message = `Key ${key.keyNumber} (${key.keyName}) assigned successfully`;
      } else if (qrData.type === "KEY_RETURN") {
        if (key.status !== "unavailable") {
          throw new Error("Key is not currently taken");
        }

        updatedKeys = keys.map(k =>
          k.id === qrData.keyId
            ? {
                ...k,
                status: "available",
                takenBy: null,
                takenAt: null,
                returnedAt: new Date().toISOString()
              }
            : k
        );
        message = `Key ${key.keyNumber} (${key.keyName}) returned successfully`;
      }

      set({
        keys: updatedKeys,
        isLoading: false,
        activeQRRequest: null
      });

      handleSuccess(message);
      return { success: true, message, key };
    } catch (error) {
      const errorMessage = handleError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Manually collect key (for security users)
  manuallyCollectKey: async (keyId) => {
    set({ isLoading: true, error: null });

    try {
      const { keys } = get();
      const key = keys.find(k => k.id === keyId);

      if (!key) {
        throw new Error("Key not found");
      }

      if (key.status !== "unavailable") {
        throw new Error("Key is not currently taken");
      }

      const updatedKeys = keys.map(k =>
        k.id === keyId
          ? {
              ...k,
              status: "available",
              takenBy: null,
              takenAt: null,
              returnedAt: new Date().toISOString()
            }
          : k
      );

      set({
        keys: updatedKeys,
        isLoading: false
      });

      handleSuccess(`Key ${key.keyNumber} (${key.keyName}) collected successfully`);
      return { success: true, key };
    } catch (error) {
      const errorMessage = handleError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Toggle frequently used status
  toggleFrequentlyUsed: async (keyId) => {
    set({ isLoading: true, error: null });

    try {
      const { keys } = get();
      const updatedKeys = keys.map(k =>
        k.id === keyId
          ? { ...k, frequentlyUsed: !k.frequentlyUsed }
          : k
      );

      set({
        keys: updatedKeys,
        isLoading: false
      });

      const key = updatedKeys.find(k => k.id === keyId);
      const message = key.frequentlyUsed
        ? "Added to frequently used keys"
        : "Removed from frequently used keys";

      handleSuccess(message);
      return { success: true };
    } catch (error) {
      const errorMessage = handleError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Clear active QR request
  clearActiveQRRequest: () => {
    set({ activeQRRequest: null });
  },

  // Fetch keys from API
  fetchKeys: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(API_URL, {
        withCredentials: true,
      });

      const keys = response.data.data.keys || [];
      set({ keys, isLoading: false });
      return keys;
    } catch (error) {
      console.error("Error fetching keys:", error);
      // Fallback to mock data if API fails
      const errorMessage = handleError(error);
      set({ keys: mockKeys, error: errorMessage, isLoading: false });
      return mockKeys;
    }
  }
}));