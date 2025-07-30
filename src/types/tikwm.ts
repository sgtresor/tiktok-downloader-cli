export interface TikWMResponse {
  code: number;
  msg: string;
  processed_time: number;
  data: {
    task_id: string;
    detail: {
      id: string;
      vid: string;
      region: string;
      title: string;
      cover: string;
      duration: number;
      play_url: string;
      download_url: string;
      size: number;
      create_time: number;
      music_info: {
        id: string;
        title: string;
        author: string;
        original: boolean;
        duration: number;
      };
      author: {
        id: string;
        unique_id: string;
        nickname: string;
        avatar: string;
      };
    };
    submit_time: number;
    update_time: number;
    status: number;
    msg: string;
  };
}

export interface VideoInfo {
  id: string;
  title: string;
  author: {
    username: string;
    nickname: string;
  };
  duration: number;
  size: number;
  downloadUrl: string;
}

export interface DownloadOptions {
  outputDir: string;
  showHelp?: boolean;
  showVersion?: boolean;
}