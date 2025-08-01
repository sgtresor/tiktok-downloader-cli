import { afterAll, beforeAll, describe, expect, it, spyOn } from "bun:test";
import { existsSync, mkdirSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { TikTokDownloader } from "../../src/lib/downloader.js";
import type { TikWMResponse } from "../../src/types/tikwm.js";

class MockConsole {
  log = () => {};
  
  constructor(private responses: string[]) {}
  
  async *[Symbol.asyncIterator]() {
    for (const response of this.responses) {
      yield { toString: () => response };
    }
  }
}

describe("TikTokDownloader Integration", () => {
  const testOutputDir = "./test-downloads";
  let downloader: TikTokDownloader;

  beforeAll(() => {
    downloader = new TikTokDownloader();
  });

  afterAll(() => {
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true });
    }
  });

  it("should create TikTokDownloader instance", () => {
    expect(downloader).toBeInstanceOf(TikTokDownloader);
  });

  it("should reject invalid URLs", async () => {
    expect(async () => {
      await downloader.download("https://youtube.com/invalid", testOutputDir);
    }).toThrow("Please provide a valid TikTok URL");
  });

  it("should skip download when file exists and user says no", async () => {
    const existingFile = path.join(testOutputDir, "testuser_123456789.mp4");
    
    if (!existsSync(testOutputDir)) {
      mkdirSync(testOutputDir, { recursive: true });
    }
    writeFileSync(existingFile, "existing content");

    const originalConsole = global.console;
    const mockStdoutWrite = spyOn(process.stdout, 'write').mockImplementation(() => true);
    
    global.console = new MockConsole(['n\n']) as any;

    const mockTaskResult: TikWMResponse["data"] = {
      task_id: "mock-task-id",
      detail: {
        id: "123456789",
        vid: "mock-vid", 
        region: "US",
        title: "Test Video",
        cover: "https://mock-cover.jpg",
        duration: 30,
        play_url: "",
        download_url: "https://mock-download.mp4",
        size: 1000000,
        create_time: 1640995200,
        music_info: {
          id: "mock-music-id",
          title: "Mock Music", 
          author: "Mock Artist",
          original: true,
          duration: 30
        },
        author: {
          id: "mock-author-id",
          unique_id: "testuser",
          nickname: "Test User",
          avatar: "https://mock-avatar.jpg"
        }
      },
      submit_time: 1640995200,
      update_time: 1640995200,
      status: 2,
      msg: ""
    };

    const submitTaskSpy = spyOn(downloader['api'], 'submitTask').mockResolvedValue('mock-task-id');
    const getTaskResultSpy = spyOn(downloader['api'], 'getTaskResult').mockResolvedValue(mockTaskResult);

    await downloader.download("https://www.tiktok.com/@testuser/video/123456789", testOutputDir);

    const fileContent = await Bun.file(existingFile).text();
    expect(fileContent).toBe("existing content");

    unlinkSync(existingFile);
    global.console = originalConsole;
    mockStdoutWrite.mockRestore();
    submitTaskSpy.mockRestore();
    getTaskResultSpy.mockRestore();
  });

  it("should proceed with download when file exists and user says yes", async () => {
    const existingFile = path.join(testOutputDir, "testuser_987654321.mp4");
    
    if (!existsSync(testOutputDir)) {
      mkdirSync(testOutputDir, { recursive: true });
    }
    writeFileSync(existingFile, "old content");

    const originalConsole = global.console;
    const mockStdoutWrite = spyOn(process.stdout, 'write').mockImplementation(() => true);
    
    global.console = new MockConsole(['y\n']) as any;

    const mockTaskResult: TikWMResponse["data"] = {
      task_id: "mock-task-id-2",
      detail: {
        id: "987654321",
        vid: "mock-vid-2",
        region: "US", 
        title: "Test Video 2",
        cover: "https://mock-cover-2.jpg",
        duration: 45,
        play_url: "",
        download_url: "https://mock-download-2.mp4",
        size: 2000000,
        create_time: 1640995300,
        music_info: {
          id: "mock-music-id-2",
          title: "Mock Music 2",
          author: "Mock Artist 2", 
          original: true,
          duration: 45
        },
        author: {
          id: "mock-author-id-2",
          unique_id: "testuser",
          nickname: "Test User",
          avatar: "https://mock-avatar-2.jpg"
        }
      },
      submit_time: 1640995300,
      update_time: 1640995300,
      status: 2,
      msg: ""
    };

    const submitTaskSpy = spyOn(downloader['api'], 'submitTask').mockResolvedValue('mock-task-id-2');
    const getTaskResultSpy = spyOn(downloader['api'], 'getTaskResult').mockResolvedValue(mockTaskResult);

    // Mock fetch properly
    const mockFetch = spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-length': '2000000' }),
      body: {
        getReader: () => ({
          read: async () => ({ done: true, value: undefined }),
          releaseLock: () => {}
        })
      }
    } as unknown as Response);

    // Mock Bun.file
    const mockWriter = { write: () => {}, end: () => {} };
    const mockBunFile = spyOn(Bun, 'file').mockReturnValue({ 
      writer: () => mockWriter 
    } as any);

    await downloader.download("https://www.tiktok.com/@testuser/video/987654321", testOutputDir);

    expect(submitTaskSpy).toHaveBeenCalledWith("https://www.tiktok.com/@testuser/video/987654321");
    expect(getTaskResultSpy).toHaveBeenCalledWith('mock-task-id-2');

    if (existsSync(existingFile)) {
      unlinkSync(existingFile);
    }
    
    mockFetch.mockRestore();
    mockBunFile.mockRestore();
    global.console = originalConsole;
    mockStdoutWrite.mockRestore();
    submitTaskSpy.mockRestore();
    getTaskResultSpy.mockRestore();
  });
});