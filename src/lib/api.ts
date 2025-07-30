import type { TikWMResponse } from "../types/tikwm.js";

export class TikWMAPI {
  private readonly baseUrl = "https://www.tikwm.com/api/video";
  private readonly userAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36";

  async submitTask(url: string): Promise<string> {
    const formData = new FormData();
    formData.append("url", url);

    const response = await fetch(`${this.baseUrl}/task/submit`, {
      method: "POST",
      body: formData,
      headers: {
        "User-Agent": this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json() as TikWMResponse;

    if (data.code !== 0) {
      throw new Error(`API error: ${data.msg}`);
    }

    return data.data.task_id;
  }

  async getTaskResult(taskId: string, maxRetries = 10): Promise<TikWMResponse["data"]> {
    for (let i = 0; i < maxRetries; i++) {
      const response = await fetch(`${this.baseUrl}/task/result?task_id=${taskId}`, {
        headers: {
          "User-Agent": this.userAgent,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json() as TikWMResponse;

      if (data.code !== 0) {
        throw new Error(`API error: ${data.msg}`);
      }

      // Status 2 means processing complete
      if (data.data.status === 2 && data.data.detail.download_url) {
        return data.data;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (i < maxRetries - 1) {
        process.stdout.write(".");
      }
    }

    throw new Error("Video processing timed out. Please try again later.");
  }
}