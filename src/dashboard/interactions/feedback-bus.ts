type EventCallback = (data: any) => void;

export interface UserIntent {
  type: string;
  payload: any;
}

class FeedbackBus {
  private listeners: Record<string, EventCallback[]> = {};

  publish(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Return an unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }
}

export const feedbackBus = new FeedbackBus(); 