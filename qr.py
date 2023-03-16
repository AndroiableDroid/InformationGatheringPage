from pyqrcode import QRCode
import png

def createQr(data: dict) -> None:
    url = QRCode(str(data))
    data['qr'] = url.png_as_base64_str(scale=5)
