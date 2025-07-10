import connectDB from "../../db";

export abstract class BaseStorage {
  private isConnected = false;

  constructor() {
    this.initConnection();
  }

  private async initConnection() {
    try {
      await connectDB();
      this.isConnected = true;
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.warn("MongoDB connection failed:", error instanceof Error ? error.message : error);
      this.isConnected = false;
    }
  }

  protected async ensureConnection() {
    if (!this.isConnected) {
      await this.initConnection();
    }
  }

  protected handleError(operation: string, error: unknown): void {
    console.error(`Error ${operation}:`, error);
  }
}