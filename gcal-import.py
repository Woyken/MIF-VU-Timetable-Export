from __future__ import print_function
import httplib2
import os

from apiclient import discovery
from oauth2client import client
from oauth2client import tools
from oauth2client.file import Storage

import datetime

import json

jsondata = json.load(open('exportedLectures.json', encoding="utf-8"))

try:
    import argparse

    flags = argparse.ArgumentParser(parents=[tools.argparser]).parse_args()
except ImportError:
    flags = None

# If modifying these scopes, delete your previously saved credentials
# at ~/.credentials/calendar-python-quickstart.json
SCOPES = 'https://www.googleapis.com/auth/calendar'
CLIENT_SECRET_FILE = 'client_secret.json'
APPLICATION_NAME = 'Google Calendar API Python Quickstart'


def get_credentials():
    """Gets valid user credentials from storage.

    If nothing has been stored, or if the stored credentials are invalid,
    the OAuth2 flow is completed to obtain the new credentials.

    Returns:
        Credentials, the obtained credential.
    """
    home_dir = os.path.abspath("")
    credential_dir = os.path.join(home_dir, '.credentials')
    if not os.path.exists(credential_dir):
        os.makedirs(credential_dir)
    credential_path = os.path.join(credential_dir,
                                   'calendar-python-quickstart.json')

    store = Storage(credential_path)
    credentials = store.get()
    if not credentials or credentials.invalid:
        flow = client.flow_from_clientsecrets(CLIENT_SECRET_FILE, SCOPES)
        flow.user_agent = APPLICATION_NAME
        if flags:
            credentials = tools.run_flow(flow, store, flags)
        else:  # Needed only for compatibility with Python 2.6
            credentials = tools.run(flow, store)
        print('Storing credentials to ' + credential_path)
    print('Storing credentials to ' + credential_path)
    return credentials


def main():
    credentials = get_credentials()
    http = credentials.authorize(httplib2.Http())
    service = discovery.build('calendar', 'v3', http=http)

    all_calendars = service.calendarList().list().execute()

    print("To which calendar do you want to add all events?")
    cal_counter = 0
    for calendar in all_calendars['items']:
        cal_counter += 1
        print(str(cal_counter) + ': ' + calendar['summary'])
    input_id = input('ID: ')
    input_id = int(input_id)
    if input_id < 1 or input_id > len(all_calendars['items']):
        raise "unexpected ID " + str(input_id)

    calendar_item = all_calendars['items'][input_id-1]

    for dataitem in jsondata:
        desc = dataitem['eventType'] + '\n' + dataitem['lecturer'] + '\n' + dataitem['rooms']
        title = dataitem['subjectName'] + dataitem['subgroups'] + ' (' + dataitem['subjectType'] + ')'
        loc = dataitem['rooms']

        bodyo = {
            'end': {
                'dateTime': dataitem['end'],
                'timeZone': 'Europe/Vilnius'
            },
            'start': {
                'dateTime': dataitem['start'],
                'timeZone': 'Europe/Vilnius'
            },
            'description': desc,
            'summary': title,
            'location': loc
        }
        service.events().insert(
            calendarId=calendar_item['id'],
            body=bodyo).execute()


if __name__ == '__main__':
    main()
