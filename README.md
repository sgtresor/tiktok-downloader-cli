# 🎵 TikTok Downloader CLI

A fast, lightweight CLI tool for downloading highest quality TikTok videos without watermarks.

Built with 🧪 Bun. Powered by [tikwm.com](https://tikwm.com/originalDownloader.html).


## ✨ Features

- 🎥 **Best quality** — Downloads original quality videos without 720p limit
- 🚫 **No Watermarks**: Clean downloads without TikTok branding
- 🔗 **Flexible URL Support**: Works with all TikTok URL formats
- 📊 **Progress Tracking**: Real-time download progress with speed indicators


## 🛠️ Installation

To get started, you need a JavaScript runtime installed on your system. You can use either Node.js (which includes npm) or Bun.

### Step 1: Install a Runtime

<details>
<summary><b>Option A: Install Node.js (includes npm)</b></summary>

The most common method. If you don't have it, get the LTS version from the [official Node.js website](https://nodejs.org/).

</details>

<details>
<summary><b>Option B: Install Bun</b></summary>

For the fastest experience. You can install it with a single command. See the [official Bun website](https://bun.sh) for details.

```bash
curl -fsSL [https://bun.sh/install](https://bun.sh/install) | bash
```

</details>

### Step 2: Install and Use the CLI
Once you have a runtime, open your terminal and install the tool globally.
<details>
<summary><b>With npm</b></summary>

```bash
npm install -g tiktok-downloader-cli
```
</details>

<details>
<summary><b>With Bun</b></summary>

```bash
bun install -g tiktok-downloader-cli
```
</details>

That's it! You can now use the td command from anywhere.

```bash
# Test it out with a TikTok URL
td "[https://www.tiktok.com/@user/video/12345](https://www.tiktok.com/@user/video/12345)"
```

## 🕹️ Usage

### Basic Usage

```bash
# download a highest quality tiktok video available
td "https://www.tiktok.com/@user/video/1234567890123456789"

# Download with custom output directory
td "https://vm.tiktok.com/ZMxxxxxx/" -o ~/Videos
```

### Supported URL Formats

```bash
# Standard TikTok URLs
td "https://www.tiktok.com/@username/video/1234567890123456789"

# Short URLs
td "https://vm.tiktok.com/ZMxxxxxx/"
td "https://vt.tiktok.com/ZMxxxxxx/"
```

### 🔧 CLI Options

```bash
Usage: td [options] <url>

Options:
  -o, --output <dir>          Output directory (default: current directory)
  --version                   Show version information
  -h, --help                  Display help information

Examples:
  td "https://www.tiktok.com/@user/video/123"
  td "https://www.tiktok.com/@user/video/456" -o ~/Videos
```

## ⚙️ How It Works

`td` uses the **tikwm.com API** to fetch TikTok videos without watermarks. The process is:

1. 🧾 **Input Parsing**  
   You run the CLI with a TikTok video URL. The tool validates the URL format and prepares the output directory if it doesn’t exist.

2. 📬 **Submit Download Task**  
   The video URL is submitted to `tikwm.com` via their official task API endpoint. This returns a task ID used to track processing status.

3. ⏳ **Wait for Processing**  
   The tool polls the API until the video is fully processed. Once ready, it retrieves the final metadata and download URL.

4. 📄 **Generate Filename**  
   A filename is generated using the video ID and author name, and cleaned for safe filesystem use.

5. 📥 **Download the File**  
   The video is streamed directly to disk using Bun’s writer and real-time progress is shown in the terminal.

6. ✅ **Done**  
   When the download completes, the file is saved in your selected output folder with a clean `.mp4` filename.



## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💖 Credits

- 🧠 [tikwm.com](https://tikwm.com/originalDownloader.html) — makes this whole thing possible
- 🧪 [Bun](https://bun.sh) — speedy toolchain FTW
- 📱 TikTok creators — you're the real MVPs

## ⚠️ Disclaimer

**IMPORTANT: This tool is for personal use only.**

By using `td`, you acknowledge that:

- Downloaded content is subject to copyright and intellectual property laws
- You will only download content you have permission to download
- Commercial use requires explicit permission from content owners
- You are responsible for complying with TikTok's Terms of Service
- The developers are not responsible for any misuse of this tool

Please respect content creators' rights and use this tool responsibly. Support your favorite TikTok creators through official channels.

---

Made with ❤️ for the TikTok community
