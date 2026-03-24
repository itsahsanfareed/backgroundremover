# ClearDrop Background Remover API

ClearDrop is a high-performance, AI-powered Background Remover and Developer API built carefully with FastAPI and `rembg`. It provides a stunning, production-ready SaaS landing page and an integrated Developer Portal out-of-the-box.

![ClearDrop UI Preview](./static/api.html) *(See live preview in local execution)*

## Features

- ⚡️ **Lightning Fast Output:** Powered by `rembg` U2Net architecture for 1-2 second foreground extractions.
- 🎨 **Solid Color Insertion:** Drop in a hex color on the fly to convert transparent spaces to a beautiful solid backdrop.
- 🔑 **Built-in API Generation:** Sell your API immediately! A discrete Developers Portal allows users to generate secure 32-character API Keys.
- 🛡️ **Extensible Auth System:** Pre-configured `Depends` FastAPI structure allows instant locking-down of your background generation endpoint using the `x-api-key` header.
- 💅 **Modern SaaS GUI:** Clean, beautifully responsive "Landing Page" architecture written entirely in HTML/Vanilla JS with zero heavy frameworks.

## Quick Start

### 1. Installation

Ensure you have Python 3.9+ installed. Clone the repository and install the dependencies.

```bash
git clone https://github.com/itsahsanfareed/backgroundremover.git
cd backgroundremover

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On MacOS/Linux:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 2. Run the Application

Start the local FastAPI application using Uvicorn with auto-reload.

```bash
uvicorn main:app --reload --port 8000
```

> **Note:** The very first request to the ML engine will take up to ~10-15 seconds as `rembg` downloads the U2Net model weights (~170MB) to your local machine. All subsequent requests will resolve instantly.

### 3. Usage

- **Web Interface:** Open your browser and navigate to [http://localhost:8000](http://localhost:8000) to use the beautiful SaaS tool.
- **Developer Portal:** Click "Developers / API" or navigate to [http://localhost:8000/static/api.html](http://localhost:8000/static/api.html) to read the endpoints guide and generate an API key.

## API Documentation

### `POST /api/remove-bg`

Removes the background from an uploaded image and yields a fully transparent PNG.

#### Headers
- `x-api-key`: (Optional/Required based on your backend config) - Your generated API Key.

#### Form Data (`multipart/form-data`)
- `image`: The image file (JPG, PNG, WEBP). Required.
- `bg_color`: Hex code (e.g. `#FF0000`). Optional. The API will apply this color behind the subject instead of returning a transparent image.

#### Example (cURL)
```bash
curl -X POST "http://localhost:8000/api/remove-bg" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/path/to/your/image.jpg" \
  --output "result.png"
```

## Built With
- [FastAPI](https://fastapi.tiangolo.com)
- [rembg](https://github.com/danielgatis/rembg)
- [Pillow](https://python-pillow.org/)

## License
MIT License. See `LICENSE` for more information.
