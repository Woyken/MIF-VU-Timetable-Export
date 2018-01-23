# Attempt to export timetables from Vilnius University MIF timetable system. (Extra-hacky)

Use javascript script provided in 'Userscript for browser' directly on the page in browser's developer's console. 

Navigate to your [group page](https://mif.vu.lt/timetable/mif/groups/612i30001-programu-sistemos-3-k-4-gr-2017/)

Now just copy [the script](https://raw.githubusercontent.com/Woyken/MIF-VU-Timetable-Export/master/Userscript%20for%20browser/MIF%20VU%20Timetable%20exporter.js) to developer's console.

Exported events will be copied to clipboard (json format).

Create file named 'exportedLectures.json' in folder, where python script is located.

Continue to python part in order to import events to Google calendar.

# For google-calendar importing, use the python:

Use [this wizard](https://console.developers.google.com/start/api?id=calendar) to create or select a project in the Google Developers Console and automatically turn on the API. Click Continue, then Go to credentials.
On the Add credentials to your project page, click the Cancel button.
At the top of the page, select the OAuth consent screen tab. Select an Email address, enter a Product name if not already set, and click the Save button.
Select the Credentials tab, click the Create credentials button and select OAuth client ID.
Select the application type Other, enter the name "VU MIF timetabe export", and click the Create button.
Click OK to dismiss the resulting dialog.
Click the file_download (Download JSON) button to the right of the client ID.
Move this file to your working directory and rename it client_secret.json.

python prerequisite: pip install --upgrade google-api-python-client


