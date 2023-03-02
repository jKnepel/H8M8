*** Settings ***

Library  Collections
Library  RequestsLibrary

*** Variables ***
${BACKEND_URL}  ${BACKEND_HOST}
${AUTH_URL}  ${BACKEND_URL}/auth/token
${BOT_CLASSIFY_URI}  /bot/classify/
${BOT_REPORT_URI}  /bot/comment/report/
${STATISTIC_REPORTED_COMMENTS_URI}  /statistic/comment/reports/
${STATISTIC_CLASSIFY_MANUALLY_URI}  /statistic/classify/manual/
${STATISTIC_GET_AVAILABLE_CLASSIFICATIONS_URI}  /statistic/comment/classifications/
${STATISTIC_CHAT_GROUPS_URI}  /statistic/chatgroups/
${BOT_CREATE_SESSION_URI}  /bot/session/
&{headers}  Content-Type=application/json
&{harmful_slander_dict}  id=${7}  classification=harmful slander
&{create_session_payload}  source_app_server_id=${12345}  source_app_name=zoom  server_name=my-zoom-server

${classify_text_no_hate}  {"chatUser": {"chatUserName": "robot"}, "chatGroup": {"chatGroupName": "sys-dev"},
...                "commentText": "i love the robotframework syntax", "timestamp": "2022-11-12-16:45",
...                "sourceAppCommentId": "zoom-id-123", "server": {"id": "zoom-server-1"}}

${classify_text}  {"chatUser": {"chatUserName": "robot-hater"}, "chatGroup": {"chatGroupName": "sys-dev"},
...                "commentText": "fuck you", "timestamp": "2022-11-12-16:50",
...                "sourceAppCommentId": "zoom-id-1234", "server": {"id": "zoom-server-1"}}

${report_text}  {"source_app_name": "zoom", "source_app_comment_id": "zoom-id-123"}

${expected_reported_comment}=  {"moderatorClassificationId": null, "user": "robot", "commentText": "i love the robotframework syntax",
...  "manuallyReported": true, "reviewedByModerator": false, "timestamp": "2022-11-12T16:45:00Z", "sourceAppCommentId": "zoom-id-123",
...  "sourceAppName": "zoom", "classifierClassificationId": 0, "classifierClassificationText": "no hate"}

${classify_manually_payload}   {"source_app_name": "zoom", "source_app_comment_id": "zoom-id-123",
...        "manual_classification_id": 0 }
${available_classifications}  [{"id":7,"classification":"harmful slander"},{"id":3,"classification":"violence & killing"},
...  {"id":1,"classification":"negative stereotyping"},{"id":0,"classification":"no hate"},
...  {"id":4,"classification":"equation"},{"id":5,"classification":"normalization of existing discrimination"},
...  {"id":2,"classification":"dehumanization"},{"id":6,"classification":"disguise as irony"}]

*** Test Cases ***

Get authorization check status code
  ${data}=  Create dictionary  username=admin  password=admin
  ${resp}=  Post  ${AUTH_URL}/  json=${data}  expected_status=200
  ${token}=  Set Variable  ${resp.json()["access"]}
  ${header}=  create dictionary  Content-Type=application/json  Accept=application/json  authorization=Bearer ${token}
  create session  alias=default  url=${BACKEND_URL}  headers=${header}
  Dictionary Should Contain Key    ${resp.json()}    access
  Dictionary Should Contain Key    ${resp.json()}    refresh
  Dictionary Should Contain Key    ${resp.json()}    username
  Dictionary Should Contain Key    ${resp.json()}    groups

Auth wrong credentials
  ${data}=  Create dictionary  username=admin  password=wrong-password
  Post  ${AUTH_URL}/  json=${data}  expected_status=401

Create Bot Session
  ${response}=  Put On Session  default   /${BOT_CREATE_SESSION_URI}  json=${create_session_payload}  expected_status=201
  ${server_id}=  Set Variable  ${response.json()["serverId"]}
  ${SERVER_DICT}=  Create Dictionary  id=${server_id}
  Set Global Variable    ${SERVER_DICT}

Classify No Hate
  ${data}=    Evaluate    json.loads('''${classify_text_no_hate}''')    json
  Set To Dictionary    ${data}  server  ${SERVER_DICT}
  ${response}=  Post On Session  default   /${BOT_CLASSIFY_URI}  json=${data}  expected_status=201
  Should Be Equal As Strings  0  ${response.json()}[id]
  Should Be Equal As Strings  no hate  ${response.json()}[classification]

Classify Hate Speech
  ${data}=    Evaluate    json.loads('''${classify_text}''')    json
  Set To Dictionary    ${data}  server  ${SERVER_DICT}
  ${response}=  Post On Session  default   /${BOT_CLASSIFY_URI}  json=${data}  expected_status=201
  Should Be Equal As Strings  7  ${response.json()}[id]
  Should Be Equal As Strings  harmful slander  ${response.json()}[classification]

Report Comment
  ${data}=    Evaluate    json.loads('''${report_text}''')    json
  Post On Session  default   /${BOT_REPORT_URI}  json=${data}  expected_status=204

Get Reported Comments
  ${expected_data}=    Evaluate    json.loads('''${expected_reported_comment}''')    json
  ${response}=  Get On Session  default   /${STATISTIC_REPORTED_COMMENTS_URI}  expected_status=200
  List Should Contain Value    ${response.json()}    ${expected_data}

Classify Reported Comment Manually
  ${data}=    Evaluate    json.loads('''${classify_manually_payload}''')    json
  ${response}=  Post On Session  default   /${STATISTIC_CLASSIFY_MANUALLY_URI}  json=${data}  expected_status=200

Verify Manual Classification
  ${response}=  Get On Session  default   /${STATISTIC_REPORTED_COMMENTS_URI}  expected_status=200
  Should Be Empty    ${response.json()}

Get Available Classifications
  ${response}=  Get On Session  default   /${STATISTIC_GET_AVAILABLE_CLASSIFICATIONS_URI}  expected_status=200
  ${expected_data}=    Evaluate    json.loads('''${available_classifications}''')    json
  Should Be Equal  ${response.json()}  ${expected_data}

