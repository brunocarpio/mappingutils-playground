// adapted from https://freedium.cfd/https://medium.com/geekculture/sveltekit-web-worker-8cfc0c86abf6

export default class ScriptEvaluator {
    private worker: Worker | null = null;

    private async getWorker() {
        if (this.worker === null) {
            let workerScript: Worker = await import("$lib/WorkerScript?worker");
            this.worker = new workerScript.default();
        }

        return this.worker;
    }

    public killWorker() {
        this.worker?.terminate();
        this.worker = null;
    }

    public async evalAsync(message: object, timeout = 1000): Promise<string> {
        let worker = await this.getWorker();
        return new Promise((resolve, reject) => {
            // Handle timeout
            let handle = setTimeout(() => {
                this.killWorker();
                reject("timeout");
            }, timeout);

            // Send the script to eval to the worker
            worker.postMessage(message);

            // Handle result
            worker.onmessage = (e) => {
                clearTimeout(handle);
                resolve(e.data);
            };

            worker.onerror = (e) => {
                clearTimeout(handle);
                reject((e as any).message);
            };
        });
    }
}
