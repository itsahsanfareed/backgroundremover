import io
import os
import json
import secrets
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Header, Depends, Form
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from rembg import remove
from PIL import Image

app = FastAPI(title="Background Remover API", version="1.1.0")

# --- Database Mock for API Keys ---
KEYS_FILE = "api_keys.json"

def load_keys():
    if not os.path.exists(KEYS_FILE):
        return []
    with open(KEYS_FILE, "r") as f:
        return json.load(f)

def save_key(key: str):
    keys = load_keys()
    keys.append(key)
    with open(KEYS_FILE, "w") as f:
        json.dump(keys, f)

# --- Dependency ---
async def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """
    Optional API Key validation.
    For a fully locked-down API, change `Header(None)` to `Header(...)`.
    """
    if x_api_key is not None:
        keys = load_keys()
        if x_api_key not in keys:
            raise HTTPException(status_code=403, detail="Invalid API Key")
    return x_api_key

# --- Static Files ---
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# --- Routes ---
@app.get("/")
async def read_index():
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Frontend not found."}

@app.post("/api/generate-key", summary="Generate API Key", description="Generates a new API key for selling API access.")
async def generate_api_key():
    # Generate a secure 32-character hex string
    new_key = secrets.token_hex(16)
    save_key(new_key)
    return {"api_key": new_key, "message": "Keep this key safe! Pass it as the 'x-api-key' header in your requests."}

def hex_to_rgb(hex_color: str):
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 6:
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    return None

@app.post("/api/remove-bg", summary="Remove Background", description="Removes background and optionally sets a new solid color.")
async def remove_background(
    image: UploadFile = File(...),
    bg_color: Optional[str] = Form(None, description="Optional hex color code (e.g. #FF0000) for the new background"),
    api_key: Optional[str] = Depends(verify_api_key)
):
    if image.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid image type.")

    try:
        contents = await image.read()
        input_image = Image.open(io.BytesIO(contents))
        
        if input_image.mode != "RGBA":
            input_image = input_image.convert("RGBA")

        # High Quality Parameters: post_process_mask cleans edges, alpha_matting is great for fur/hair
        output_image = remove(input_image, post_process_mask=True, alpha_matting=True)

        # Apply custom background color if requested
        if bg_color:
            rgb_color = hex_to_rgb(bg_color)
            if rgb_color:
                # Create a solid color background image matching the output size
                background = Image.new("RGBA", output_image.size, rgb_color + (255,))
                # Paste the transparent output over the solid background using the output's alpha channel as a mask
                background.paste(output_image, mask=output_image)
                output_image = background

        output_buffer = io.BytesIO()
        output_image.save(output_buffer, format="PNG")
        output_buffer.seek(0)
        
        return StreamingResponse(output_buffer, media_type="image/png", headers={
            "Content-Disposition": f"attachment; filename=processed_{image.filename.split('.')[0]}.png"
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
