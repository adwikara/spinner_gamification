import json
import boto3
import requests
'''
Put in Dynamo DB
dynamodb = boto3.resource('dynamodb')
dynamodbTable = dynamodb.Table("rng_table")
event = {"RNG":"rng","num":3}
dynamodbTable.put_item(Item=event)
'''

'''
Get in Dynamo DB
dynamodb_resource = boto3.resource('dynamodb')
table = dynamodb_resource.Table("rng_table")
response = table.get_item(Key={ 'RNG': "rng" })
print(response['Item']['num'])
'''

'''
https://www.youtube.com/watch?v=DqLFfp3Yg_g #boto3 insert data
https://www.youtube.com/watch?v=mfAT38B_uhw #deploy api gateway
https://www.youtube.com/watch?v=ONLKIUFXLcg #table dynamoDB
https://www.youtube.com/watch?v=ikjK6Fep3dk #lambda, api gateway, DB
https://www.youtube.com/watch?v=hF_HchMREeM #python requests

'''

def upload_rng(key,num):
    add_on='?key='+key+'&num='+str(num)
    url='https://au1w91x23d.execute-api.ap-southeast-1.amazonaws.com/prod/rng'+add_on
    response = requests.get(url)
    return response

x = upload_rng('hw',12)
print(x.json())
