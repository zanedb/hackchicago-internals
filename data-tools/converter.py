# to run: 
# python data-tools/converter.py -i data-tools/data/attendees.csv -o data-tools/data/attendees.json -f pretty

# modified from https://www.idiotinside.com/2015/09/18/csv-json-pretty-print-python/

import sys, getopt
import csv
import json

# get command line arguments
def main(argv):
    input_file = ''
    output_file = ''
    format = ''
    try:
        opts, args = getopt.getopt(argv,"hi:o:f:",["ifile=","ofile=","format="])
    except getopt.GetoptError:
        # if args are invalid, print help & exit program
        print('converter.py -i <path to inputfile (CSV)> -o <path to outputfile (JSON)> -f <dump/pretty>')
        sys.exit(2)
    for opt, arg in opts:
        # if -h flag is included, print help & exit program
        if opt == '-h':
            print('converter.py -i <path to inputfile> -o <path to outputfile> -f <dump/pretty>')
            sys.exit()
        elif opt in ("-i", "--ifile"):
            input_file = arg
        elif opt in ("-o", "--ofile"):
            output_file = arg
        elif opt in ("-f", "--format"):
            format = arg
    read_csv(input_file, output_file, format)

# read CSV file
def read_csv(file, json_file, format):
    csv_rows = []
    with open(file) as csvfile:
        reader = csv.DictReader(csvfile)
        title = reader.fieldnames
        for row in reader:
            csv_rows.extend([{title[i]:row[title[i]] for i in range(len(title))}])
        for element in csv_rows:
            # go through JSON and remove a few columns
            element.pop('6/7 Outreach', None)
        write_json(csv_rows, json_file, format)

# convert CSV data into JSON and write it
def write_json(data, json_file, format):
    with open(json_file, "w") as f:
        if format == "pretty":
            f.write(json.dumps(data, sort_keys=False, indent=2, separators=(',', ': '),encoding="utf-8",ensure_ascii=False))
            print('Saved CSV data to '+json_file+' with format "'+format+'"')
        elif format == "dump":
            f.write(json.dumps(data))
            print('Saved CSV data to '+json_file+' with format "'+format+'"')
        else:
            print('Error: invalid format')

if __name__ == "__main__":
   main(sys.argv[1:])