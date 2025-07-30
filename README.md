# 🎵 TikTok Downloader (td)

A fast, lightweight CLI tool for downloading highest quality TikTok videos without watermarks, built with Bun.

## ✨ Features

- ⚡ **Lightning Fast**: Built with Bun for maximum performance
- 🎯 **High Quality**: Downloads videos in best available quality (up to 4K)
- 🚫 **No Watermarks**: Clean downloads without TikTok branding
- 🔗 **Flexible URL Support**: Works with all TikTok URL formats
- 📊 **Progress Tracking**: Real-time download progress with speed indicators
- 🎵 **Audio Extraction**: Download MP3 audio from TikTok videos
- 📱 **Cross-Platform**: Works on Windows, macOS, and Linux
- 🚀 **No Dependencies**: Single binary with everything included

## 🛠️ Installation

### Prerequisites

- **Bun >= 1.0.0** - [Install Bun](https://bun.sh)

### Install from Source

```bash
# Clone the repository
git clone https://github.com/sgtresor/tiktok-downloader-cli.git
cd tiktok-downloader-cli

# Install dependencies
bun install

# Build the CLI
bun run build

# Install globally
bun link

# Or run directly
bun run td [options] <url>
```

## 🚀 Usage

### Basic Usage

```bash
# Download a TikTok video
td "https://www.tiktok.com/@user/video/1234567890123456789"

# Download with custom filename
td -o "my-video.mp4" "https://vm.tiktok.com/ZMxxxxxx/"

# Extract audio only
td --audio "https://www.tiktok.com/@user/video/1234567890123456789"

# Download to specific directory
td -d "./downloads" "https://www.tiktok.com/@user/video/1234567890123456789"
```

### Supported URL Formats

```bash
# Standard TikTok URLs
td "https://www.tiktok.com/@username/video/1234567890123456789"

# Short URLs
td "https://vm.tiktok.com/ZMxxxxxx/"

# Mobile URLs
td "https://m.tiktok.com/v/1234567890123456789.html"

# Direct video IDs
td "1234567890123456789"
```

### CLI Options

```bash
Usage: td [options] <url>

Options:
  -o, --output <template>     Output filename template (default: "%(title)s.%(ext)s")
  -d, --dir <directory>       Download directory (default: current directory)
  -f, --format <format>       Video format: mp4, mov (default: mp4)
  --audio                     Extract audio only (MP3 format)
  --no-watermark             Remove watermarks (default: true)
  --hd                        Force HD quality when available
  -q, --quiet                 Suppress non-essential output
  -v, --verbose               Enable verbose logging
  --version                   Show version information
  -h, --help                  Display help information

Examples:
  td "https://www.tiktok.com/@user/video/123"
  td --audio -o "song.mp3" "https://vm.tiktok.com/abc123/"
  td -d "./videos" --hd "https://www.tiktok.com/@user/video/456"
```

## ⚙️ How It Works

`td` uses the **tikwm.com API** to fetch TikTok videos without watermarks. The process is:

1. **URL Processing**: Extracts video ID from various TikTok URL formats
2. **API Request**: Queries tikwm.com API for video metadata and download links
3. **Quality Selection**: Chooses the highest available quality (up to 4K)
4. **Download**: Streams video directly to your device with progress tracking
5. **Post-Processing**: Removes watermarks and applies any requested formatting

The tool handles TikTok's frequent API changes and provides reliable downloads through the tikwm.com service.


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

```bash
# Clone and install
git clone https://github.com/yourusername/td.git
cd td
bun install

# Run in development
bun run dev

# Run tests
bun test

# Build for production
bun run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- **[tikwm.com](https://tikwm.com)** - Reliable TikTok API service that powers this tool
- **[Bun](https://bun.sh)** - Fast JavaScript runtime and toolkit
- **TikTok Content Creators** - For the amazing content that makes this tool useful

Special thanks to the tikwm.com team for providing a stable API for TikTok video access.

## ⚠️ Disclaimer

**IMPORTANT: This tool is for personal use only.**

By using `td`, you acknowledge that:

- Downloaded content is subject to copyright and intellectual property laws
- You will only download content you have permission to download
- Commercial use requires explicit permission from content owners
- You are responsible for complying with TikTok's Terms of Service
- The developers are not responsible for any misuse of this tool

Please respect content creators' rights and use this tool responsibly. Support your favorite TikTok creators through official channels.

## 🆘 Issues & Support

- **Bug Reports**: [Open an issue](https://github.com/yourusername/td/issues/new?template=bug_report.md)
- **Feature Requests**: [Request a feature](https://github.com/yourusername/td/issues/new?template=feature_request.md)
- **Questions**: [Start a discussion](https://github.com/yourusername/td/discussions)

### Common Issues

**"Video not found" error**: The video may be private, deleted, or region-restricted.

**Slow downloads**: Check your internet connection. Some videos may have processing delays.

**API rate limits**: tikwm.com limits to 5,000 requests per day per IP address.

---

Made with ❤️ for the TikTok community