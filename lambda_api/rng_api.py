import json
import random

def lambda_handler(event, context):
    x = random.randint(0,100)
    return {
            'statusCode': 21,
            'rng':x
        }