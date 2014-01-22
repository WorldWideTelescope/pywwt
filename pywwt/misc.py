from bs4 import BeautifulSoup

class WWTException(Exception):
    pass

def handle_response(resp_str):
    soup = BeautifulSoup(resp_str)
    try:
        success = soup.layerapi.status.string
        if success != "Success":
            raise WWTException(success)
    except AttributeError:
        error = soup.html.body.h2.string
        raise WWTException(error)

def parse_kwargs(params, kwargs):
    if "date_time" in kwargs:
        params["datetime"] = kwargs["date_time"]
    if "time_rate" in kwargs:
        params["timerate"] = str(kwargs["time_rate"])
    if "fly_to" in kwargs:
        params["flyto"] = ",".join([str(i) for i in kwargs["fly_to"]])
    if "instant" in kwargs:
        params["instant"] = str(kwargs["instant"])
    if "auto_loop" in kwargs:
        params["autoloop"] = str(kwargs["auto_loop"])
