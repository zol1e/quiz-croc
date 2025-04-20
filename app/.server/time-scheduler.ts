export interface TimeScheduler {

	schedule(callback: () => void, delay: number): void;

}

export class SetTimeoutTimeScheduler {

    schedule(callback: () => void, delay: number): void {
        setTimeout(callback, delay);
    }

}
