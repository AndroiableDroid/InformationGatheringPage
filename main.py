import base64
from io import BytesIO
from fastapi import FastAPI, File, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np

from constants import MARGIN
from qr import createQr

app = FastAPI()

app.mount("/images", StaticFiles(directory="images"), name="images")
views = Jinja2Templates(directory="views")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def formatDate (date) -> str:
    date = date.split('-')
    return date[2] + '.' + date[1] + '.' + date[0]

def getFace(image: bytes) -> str:
    currentSize = len(image) / 1024
    image = np.asarray(bytearray(image), dtype="uint8")
    image = cv2.imdecode(image  , cv2.IMREAD_UNCHANGED)
    qualityRatio = 1 - ((currentSize - 1024) / currentSize)
    if qualityRatio > 0:
        size = (int(image.shape[1] * qualityRatio), int(image.shape[0] * qualityRatio))
        image = cv2.resize(image, size)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    face = face_cascade.detectMultiScale(gray, scaleFactor=1.4, minNeighbors=9)
    if len(face) == 0:
        raise TypeError("Face not Found")
    else:
        face = face[0]
    (x, y, w, h) = face
    face = image[y -MARGIN:y + h +MARGIN, x -MARGIN:x + w +MARGIN]
    _, buf = cv2.imencode(".jpg", face, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    outimage = BytesIO(buf)
    dataUrl = base64.b64encode(outimage.getvalue()).decode("utf-8")
    return dataUrl

@app.post("/process", response_class=HTMLResponse)
async def process(request: Request, picture: bytes = File(), firstname: str = Form(),
                   lastname: str = Form(), fathername: str = Form(), id: str = Form(), 
                   dateofbirth: str = Form(), batch: str = Form(), branch: str = Form(),
                   gender: str = Form(), address: str = Form(), city: str = Form(),
                   contact: int = Form(), zip: int = Form()
):
    params = dict(list(locals().items())[4:])
    name = f"{firstname.upper()} {lastname.upper()}"
    for i in params:
        if i == "dateofbirth":
            params[i] = formatDate(params[i])
        elif type(params[i]) == str:
            params[i] = params[i].upper()
    params['name'] = name
    createQr(params)

    params['request'] = request
    try:
        params['img'] = getFace(picture)
    except TypeError:
         return views.TemplateResponse("error.html", {
             "request": request,
             "error": "Face not Found"
         })
    return views.TemplateResponse("card.html", params)

@app.get("/")
async def root(request: Request, response_class=HTMLResponse):
        return views.TemplateResponse("form.html", {"request": request})
