import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immediately update the ui by adding the message and moving chat to top
    set((state) => {
      const updatedChats = [...state.chats];
      const chatIndex = updatedChats.findIndex((chat) => chat._id === selectedUser._id);
      
      if (chatIndex !== -1) {
        const [chatUser] = updatedChats.splice(chatIndex, 1);
        updatedChats.unshift(chatUser);
      } else {
        updatedChats.unshift(selectedUser);
      }

      return { 
        messages: [...state.messages, optimisticMessage],
        chats: updatedChats
      };
    });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set((state) => {
        const updatedMessages = state.messages.filter((msg) => msg._id !== tempId);
        if (!updatedMessages.some((msg) => msg._id === res.data._id)) {
          updatedMessages.push(res.data);
        }
        return { messages: updatedMessages };
      });
    } catch (error) {
      // remove optimistic message on failure
      set((state) => ({ messages: state.messages.filter((msg) => msg._id !== tempId) }));
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Remove any existing listener to avoid duplicates
    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, isSoundEnabled, chats } = get();
      const { authUser } = useAuthStore.getState();

      // Update chats list to move sender/receiver to top
      const otherUserId = newMessage.senderId === authUser._id ? newMessage.receiverId : newMessage.senderId;
      const chatIndex = chats.findIndex((chat) => chat._id === otherUserId);
      
      let updatedChats = [...chats];
      if (chatIndex !== -1) {
        const [chatUser] = updatedChats.splice(chatIndex, 1);
        updatedChats.unshift(chatUser);
        set({ chats: updatedChats });
      } else {
        // If the user isn't in our chats list, refetch chats
        get().getMyChatPartners();
      }

      // Add to current open chat if applicable
      if (selectedUser) {
        const isMessageFromSelected = newMessage.senderId === selectedUser._id;
        const isMessageToSelected = newMessage.receiverId === selectedUser._id;
        
        if (isMessageFromSelected || isMessageToSelected) {
          const currentMessages = get().messages;
          if (!currentMessages.some((msg) => msg._id === newMessage._id)) {
            set({ messages: [...currentMessages, newMessage] });
          }
        }
      }

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0; // reset to start
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));