class FeedbackBus {
    listeners = {};
    publish(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
    subscribe(event, callback) {
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
//# sourceMappingURL=feedback-bus.js.map