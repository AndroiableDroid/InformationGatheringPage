from pyqrcode import QRCode

def createQr(data: dict) -> str:
    url = QRCode(str(data))
    return url.png_as_base64_str(scale=5)
