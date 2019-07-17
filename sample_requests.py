import requests
import json
from aws_requests_auth.aws_auth import AWSRequestsAuth

def get_flask_data():
    #GET REQUEST
    response = requests.get('http://127.0.0.1:1234/spinning',auth=('spinning','RNG'))
    result = response.json()
    print(result['random_number']) #prints the type
    return result

def put_flask_data(num):
    #PUT REQUEST
    data = {'random_number': num}
    response = requests.post('http://127.0.0.1:1234/spinning/'+str(num), headers=headers, data=json.dumps(data), auth=('spinning','RNG'))
    result = response.json()
    print(result['random_number'])

def post_data(event):
    url = 'https://54dgfgvzy6.execute-api.ap-southeast-1.amazonaws.com/rng_prod/rng'
    auth = AWSRequestsAuth(aws_access_key='AKIAITMSSXLBQHTAYU6A',
                       aws_secret_access_key='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',
                       aws_host= url,
                       aws_region= 'ap-southeast-1',
                       aws_service='execute-api')
    headers = event
    response = requests.post('https://54dgfgvzy6.execute-api.ap-southeast-1.amazonaws.com/rng_prod/rng', auth=auth, headers=headers)
    return response

def get_data():
    url = 'https://3j8zxj8u84.execute-api.ap-southeast-1.amazonaws.com/prod/rng'
    auth = AWSRequestsAuth(aws_access_key='AKIAITMSSXLBQHTAYU6A',
                       aws_secret_access_key='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',
                       aws_host= url,
                       aws_region= 'ap-southeast-1',
                       aws_service='execute-api')
    response = requests.get(url, auth=auth)
    return response

x = get_data()
print(x.json())





