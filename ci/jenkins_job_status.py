import sys
import time

import requests as requests
from requests.auth import HTTPBasicAuth

if __name__ == '__main__':
    retries = 60
    user = sys.argv[1]
    access_token = sys.argv[2]
    jenkins_url = sys.argv[3]
    jenkins_job_url = sys.argv[4]
    res = ''
    time.sleep(10)  # make sure jenkins job was already started
    print('waiting for result...')
    for i in range(retries):
        r = requests.get(f'{jenkins_url}/{jenkins_job_url}/lastBuild/api/json', auth=HTTPBasicAuth(user, access_token))
        res = r.json()['result']
        if str(res) != 'None':
            break
        time.sleep(5)
    print(res)
    if res == 'SUCCESS':
        sys.exit(0)
    sys.exit(1)
