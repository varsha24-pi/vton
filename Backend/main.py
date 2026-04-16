from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from gradio_client import Client, handle_file
import cloudinary
import cloudinary.uploader
import os
import tempfile
from dotenv import load_dotenv

load_dotenv()

# Configure Cloudinary (free image hosting)
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

app = FastAPI(title="Virtual Try-On API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "running"}

@app.post("/try-on")
async def try_on(
    person_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
    garment_description: str = "clothing item"
):
    try:
        # Save uploaded files temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as person_tmp:
            person_tmp.write(await person_image.read())
            person_path = person_tmp.name

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as garment_tmp:
            garment_tmp.write(await garment_image.read())
            garment_path = garment_tmp.name

        # Call Hugging Face IDM-VTON Space (free, no API key needed)
        client = Client("yisol/IDM-VTON")

        result = client.predict(
            dict({"background": handle_file(person_path), "layers": [], "composite": None}),
            handle_file(garment_path),
            garment_description,   # garment description
            True,                  # is_checked
            True,                  # is_checked_crop
            30,                    # denoise steps (higher = better quality, slower)
            42,                    # seed
            api_name="/tryon"
        )

        # result[0] is the output image path on HF's server
        output_image_path = result[0]

        # Upload result to Cloudinary so we can return a permanent URL
        upload_response = cloudinary.uploader.upload(output_image_path)
        result_url = upload_response["secure_url"]

        # Cleanup temp files
        os.unlink(person_path)
        os.unlink(garment_path)

        return {"status": "success", "result_url": result_url}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))