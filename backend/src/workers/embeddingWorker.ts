import { parentPort } from "worker_threads";
import { pipeline } from "@xenova/transformers";

class Embedder {
  private model: Awaited<ReturnType<typeof pipeline>> | null = null;

  constructor() {
    this.initializeEmbedder();
  }

  private async initializeEmbedder() {
    if (!this.model) {
      this.model = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
      console.log("Embedder model loaded");
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    if (!this.model) {
      await this.initializeEmbedder();
    }

    const cleanText = text.trim();
    if (!cleanText) return new Array(384).fill(0);

    const output = await (this.model as any)(cleanText, {
      pooling: "mean",
      normalize: true,
    });

    const embedding = Array.from(output.data) as number[];

    return embedding;
  }
}

const embedder = new Embedder();

if (parentPort) {
  parentPort.on("message", async (msg) => {
    const { uid, text } = msg;
    try {
      const embedding = await embedder.getEmbedding(text);
      parentPort?.postMessage({ status: "success", uid, embedding });
    } catch (error) {
      parentPort?.postMessage({
        status: "error",
        uid,
        error: (error as Error).message,
      });
    }
  });
}
