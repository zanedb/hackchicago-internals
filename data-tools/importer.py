# to run: 
# make sure there is a .env with AUTH_KEY
# python data-tools/importer.py -i data-tools/data/attendees.json

import sys, getopt
import json
import requests
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='.env')

# get command line arguments
def main(argv):
    input_file = ''
    try:
        opts, args = getopt.getopt(argv,"hi:",["ifile="])
    except getopt.GetoptError:
        # if args are invalid, print help & exit program
        print('ref.py -i <path to inputfile (JSON)>')
        sys.exit(2)
    for opt, arg in opts:
        # if -h flag is included, print help & exit program
        if opt == '-h':
            print('ref.py -i <path to inputfile (JSON)>')
            sys.exit()
        elif opt in ("-i", "--ifile"):
            input_file = arg
    read_json(input_file)

# read JSON file
def read_json(file):
    with open(file) as json_data:
        data = json.load(json_data)
        # rename/remove JSON to conform to server variables
        for element in data:
            # fname
            element['fname'] = element['FNAME']
            element.pop('FNAME')
            # lname
            element['lname'] = element['LNAME']
            element.pop('LNAME')
            # email
            element['email'] = element['EMAIL']
            element.pop('EMAIL')
            # location
            element['state'] = element['STATE']
            element.pop('STATE')
            element['city'] = element['CITY']
            element.pop('CITY')
            # school
            element['school'] = element['SCHOOL']
            element.pop('SCHOOL')
            # refby
            element['ref'] = element['REFBY']
            element.pop('REFBY')
            # grade
            element['grade'] = element['GRADE']
            element.pop('GRADE')
            # timestamp
            element['timestamp'] = element['TIMESTAMP']
            element.pop('TIMESTAMP')
            # internal notes
            element['internalNotes'] = element['Internal Notes']
            element.pop('Internal Notes')
            # note
            element['note'] = element['NOTE']
            element.pop('NOTE')
            # phone
            element['phone'] = element['PHONE']
            element.pop('PHONE')
            # shirt size
            element['shirtSize'] = element['SHIRTSIZE']
            element.pop('SHIRTSIZE')
            # diet restrictions
            element['dietRestrictions'] = element['DIETRES']
            element.pop('DIETRES')
            # gender
            element['gender'] = element['GENDER']
            element.pop('GENDER')
            # remove other unused elements
            element.pop('Internal Tag')
            element.pop('CONFIRMED')

            # submit data to server (be sure AUTH_KEY is set in .env)
            auth = os.getenv("AUTH_KEY")
            r = requests.post("https://hackchicago.herokuapp.com/api/v1/attendees", data=element, headers={"Auth":auth})
            print('Attendee with EMAIL '+element['email']+' status: '+r.text)

if __name__ == "__main__":
   main(sys.argv[1:])