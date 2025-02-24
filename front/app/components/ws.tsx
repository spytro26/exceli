let socket: WebSocket | null = null;

export const getWebSocket = () => {
  if (!socket) {
    socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => console.log("WebSocket Connected");
    socket.onclose = () => console.log("WebSocket Disconnected");
  }
  return socket;
};
