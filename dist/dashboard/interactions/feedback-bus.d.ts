type EventCallback = (data: any) => void;
export interface UserIntent {
    type: string;
    payload: any;
}
declare class FeedbackBus {
    private listeners;
    publish(event: string, data: any): void;
    subscribe(event: string, callback: EventCallback): () => void;
}
export declare const feedbackBus: FeedbackBus;
export {};
//# sourceMappingURL=feedback-bus.d.ts.map