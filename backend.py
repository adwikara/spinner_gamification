import serial
import random
import requests
import json
import boto3
import time
from datetime import datetime

def get_random_number():
    try:
        ser = serial.Serial('/dev/cu.usbserial-A50285BI', 115200, timeout=None, xonxoff=False, rtscts=False, dsrdtr=False)
    except serial.SerialException as e:
        random_number = random.randint(0,100)
        #print(random_number)
        #putdata(random_number)
        upload_db(random_number)
        print("Python RNG")
        return random_number
    else:
        ser.flushInput()
        ser.flushOutput()
        data_raw = ser.readline()
        data_raw2=data_raw[:-2]
        num=int.from_bytes(data_raw2,byteorder='big')
        random_number = num % 101
        #print(random_number)
        #putdata(random_number)
        upload_db(random_number)
        print("HW RNG")
        return random_number

def putdata(num):
    #PUT REQUEST
    data = {'random_number': num}
    response = requests.post('http://127.0.0.1:1234/spinning/'+str(num), data=json.dumps(data), auth=('spinning','RNG'))
    result = response.json()
    #print(result['random_number'])

def upload_rng(key,num):
    add_on='?key='+key+'&num='+str(num)
    url='https://au1w91x23d.execute-api.ap-southeast-1.amazonaws.com/prod/rng'+add_on
    response = requests.get(url)
    return response

def upload_db(num):
    dynamodb = boto3.resource('dynamodb')
    dynamodbTable = dynamodb.Table("rng_table")
    event = {"RNG":"rng","num":num,"mode":"ON"}
    dynamodbTable.put_item(Item=event)

#get_random_number()

#Main Script
while (True):
    get_random_number()
    time.sleep(5)