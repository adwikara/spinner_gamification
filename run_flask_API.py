from flask import Flask, jsonify, request
from flask_httpauth import HTTPBasicAuth
from backend_functions import get_random_number
from apscheduler.schedulers.background import BackgroundScheduler

#define app using Flask
app = Flask(__name__)

#parameters = [{'name' : 'trash'}, {'class' : 'trash'}, {'percentage' : '-1'}]
parameters = {'random_number' : '-1'}
 
#Background Scheduler

cron = BackgroundScheduler(blocking=True)
cron.add_job(func=get_random_number, trigger="interval", seconds=10)
cron.start()

#Authentication
auth = HTTPBasicAuth()

@auth.get_password
def get_password(username):
    if username == 'spinning':
        return 'RNG'
    return None

@auth.error_handler
def unauthorized():
    return make_response(jsonify({'error': 'Unauthorized access'}), 401)

#Getting information from the API server
@app.route('/spinning', methods=['get'])
#@auth.login_required
def get_number():
	return jsonify(parameters)

#Updating information in the API server
@app.route('/spinning/<int:random>', methods=['post'])
@auth.login_required
def change_data(random):
	#Get data to put into the server
	data = {'random_number':random}
	#Update the parameters dictionary
	parameters['random_number'] = data['random_number']
	#Return the new dictionary
	return jsonify(parameters)

#Delete dictionary key from dictionary
@app.route('/spinning/<string:data_name>', methods=['delete'])
@auth.login_required
def remove():
	parameters.pop(data_name, None)
	return jsonify(parameters)


if __name__ == '__main__':
	#Run app in debug mode
	#Port is set to 1234, a type of security layer
	app.run(debug=True, port=1234)