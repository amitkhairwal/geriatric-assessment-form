const SAVE_DELAY_MS = 800;

// There is no backend in this task, so saving is just a short wait.
export const fakeSave = () => new Promise<void>((resolve) => setTimeout(resolve, SAVE_DELAY_MS));
