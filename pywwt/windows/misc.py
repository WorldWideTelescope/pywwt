from bs4 import BeautifulSoup
import requests

__all__ = ['WWTException', 'get_soup', 'handle_response', 'parse_kwargs']


class WWTException(Exception):
    pass


def get_soup(url, params):
    u = requests.get(url, params=params)
    soup = BeautifulSoup(u.content, "xml")
    return soup, u.content


def handle_response(resp_str):
    soup = BeautifulSoup(resp_str, "xml")
    try:
        success = soup.LayerApi.Status.string
        if success != "Success":
            raise WWTException(success)
    except AttributeError:
        soup2 = BeautifulSoup(resp_str)
        error = soup2.html.body.h2.string
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
