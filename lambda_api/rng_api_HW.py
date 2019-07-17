import json
import random
import boto3


def lambda_handler(event, context):
    #If request from the hardware, use the hardware RNG as the seed
    dynamodb = boto3.resource('dynamodb')
    dynamodbTable = dynamodb.Table("rng_table")
    response = dynamodbTable.get_item(Key={ 'RNG': "rng" })
    num = response['Item']['num']
    mode = response['Item']['mode']
    
    
    #Hardware Generated
    if (mode == "ON"):
        x = num
        dynamodb = boto3.resource('dynamodb')
        dynamodbTable = dynamodb.Table("rng_table")
        event = {"RNG":"rng","num":-1,"mode":'OFF'}
        dynamodbTable.put_item(Item=event)
        return {
            'statusCode': 200,
            'rng_number': x,
            'mode:': 'HW Generated'
        }
    #Python Generated
    else:
        x = random.randint(0,100)
        dynamodb = boto3.resource('dynamodb')
        dynamodbTable = dynamodb.Table("rng_table")
        event = {"RNG":"rng","num":-1,"mode":'OFF'}
        dynamodbTable.put_item(Item=event)
        return {
            'statusCode': 200,
            'rng_number': x,
            'mode:': 'Python Generated'
        }