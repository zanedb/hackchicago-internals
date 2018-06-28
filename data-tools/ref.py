# to run: 
# python data-tools/ref.py -i data-tools/data/attendees.json

import sys, getopt
import json
from collections import Counter

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
        referrals = []
        referral_total = 0
        for element in data:
            ref = element['REFBY']
            if ref != "":
                referral_total += 1
                referrals.append(ref)
        cnt = Counter(referrals)
        # print all referrals, in order from greatest to lowest
        print('All referrals:')
        for ref_person in cnt.most_common():
            print(ref_person)
        print('Total referrals:\n'+str(referral_total))

if __name__ == "__main__":
   main(sys.argv[1:])