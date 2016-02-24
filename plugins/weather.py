import thread, sys, os
#To fetch weather
import re
import datetime
import struct
import urllib
import feedparser
import requests
import bs4
week   = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
def getWeather(location, time):
    if(time==None):
        time = datetime.datetime.now()
    else:
        time = datetime.datetime.strptime(time, "%Y-%m-%d" )
    raw_forecast = get_forecast_by_name(location)
    clean_forecast = cleanForecast(raw_forecast, time);
    quick_forecast = shortenForecast(clean_forecast, 2)
    return quick_forecast
def replaceAcronyms(text):
    """
    Replaces some commonly-used acronyms for an improved verbal weather report.
    """

    def parseDirections(text):
        words = {
            'N': 'north',
            'S': 'south',
            'E': 'east',
            'W': 'west',
        }
        output = [words[w] for w in list(text)]
        return ' '.join(output)
    acronyms = re.findall(r'\b([NESW]+)\b', text)

    for w in acronyms:
        text = text.replace(w, parseDirections(w))

    text = re.sub(r'(\b\d+)F(\b)', '\g<1> Fahrenheit\g<2>', text)
    text = re.sub(r'(\b)mph(\b)', '\g<1>miles per hour\g<2>', text)
    text = re.sub(r'(\b)in\.', '\g<1>inches', text)

    return text
def shortenForecast(clean_forecast, nsentence):
    sentences = clean_forecast.split(". ")[0:nsentence];
    print sentences
    return ". ".join(sentences)+".";
def get_locations():
    r = requests.get('http://www.wunderground.com/about/faq/' +
                     'international_cities.asp')
    soup = bs4.BeautifulSoup(r.text)
    data = soup.find(id="inner-content").find('pre').string
    # Data Stucture:
    #  00 25 location
    #  01  1
    #  02  2 region
    #  03  1
    #  04  2 country
    #  05  2
    #  06  4 ID
    #  07  5
    #  08  7 latitude
    #  09  1
    #  10  7 logitude
    #  11  1
    #  12  5 elevation
    #  13  5 wmo_id
    s = struct.Struct("25s1s2s1s2s2s4s5s7s1s7s1s5s5s")
    for line in data.splitlines()[3:]:
        row = s.unpack_from(line)
        info = {'name': row[0].strip(),
                'region': row[2].strip(),
                'country': row[4].strip(),
                'latitude': float(row[8].strip()),
                'logitude': float(row[10].strip()),
                'elevation': int(row[12].strip()),
                'id': row[6].strip(),
                'wmo_id': row[13].strip()}
        yield info


def get_forecast_by_name(location_name):
    entries = feedparser.parse("http://rss.wunderground.com/auto/rss_full/%s"
                               % urllib.quote(location_name))['entries']
    if entries:
        # We found weather data the easy way
        return entries
    else:
        # We try to get weather data via the list of stations
        for location in get_locations():
            if location['name'] == location_name:
                return get_forecast_by_wmo_id(location['wmo_id'])


def get_forecast_by_wmo_id(wmo_id):
    return feedparser.parse("http://rss.wunderground.com/auto/" +
                            "rss_full/global/stations/%s.xml"
                            % wmo_id)['entries']


def cleanForecast(forecast, time):
    """
    Responds to user-input, typically speech text, with a summary of
    the relevant weather for the requested date (typically, weather
    information will not be available for days beyond tomorrow).
    Arguments:
        text -- user-input, typically transcribed speech
    """

    if not forecast:
        return "Could not find the forecast for this location."


    date = time;
    weekday = week[date.weekday()]
    if date.weekday() == datetime.datetime.now().weekday():
        date_keyword = "Today"
        weekday = "tonight"
    elif date.weekday() == (
            datetime.datetime.now().weekday() + 1) % 7:
        date_keyword = "Tomorrow"
    else:
        date_keyword = "On " + weekday
    output = None
    print weekday
    for entry in forecast:
        try:
            date_desc = entry['title'].split()[0].strip().lower()
            print date_desc
            if date_desc == "current":
                print "penis"
                output = entry["summary"]
            elif weekday == date_desc:
                #output = date_keyword + ", the weather will be " + weather_desc + "."
                output = entry["summary"]
                break
        except:
            print "Parsing failed"
            continue

    if output:
        return replaceAcronyms(output)
    else:
        return "Could not find the weather report."
def main(argv):
    try:
       location = argv[0]
    except:
        location = "77005"
    weather = getWeather(location, None);
    print "Got Weather Report: "+weather
    thread.start_new_thread(os.system, ("espeak '"+weather+"'",))
if __name__ == "__main__":
    main(sys.argv[1:])
