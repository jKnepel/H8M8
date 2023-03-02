import pymongo
import re
import validators
import json

client = pymongo.MongoClient('mongodb+srv://testUser:345987@cluster0.fw7hv.mongodb.net/?retryWrites=true&w=majority')#("mongodb://localhost:27017/") # Stellt eine Verbindung zum lokalen "Server" für die Datenbank her
database = client.hatespeechClassification # Stellt eine Verbidung zur gleichnamigen Datenbank her oder erstellt eine neue solche Datenbank, wenn sie noch nicht existiert.
msgColl = database.messageCollection # Ruft die spezifizierte Collection für msgColl.
wrdColl = database.wordCollection
usrColl = database.userCollection
chnColl = database.channelCollection
rplColl = database.replaceCollection

userIndexes = ["id", "name", "isBot", "numTotal", "numFlagged", "noHate", "negativeStereotyping", "dehumanization", "violenceKilling", "equation", "normalization", "irony", "harmfulSlanderGeneral", "undetermined", "flaggedRatio", "mostFlagged"]
wordIndexes = ["word", "numTotal", "numFlagged", "noHate", "negativeStereotyping", "dehumanization", "violenceKilling", "equation", "normalization", "irony", "harmfulSlanderGeneral", "undetermined", "flaggedRatio", "mostFlagged"]



#TODO: REFACTOR THIS MESS


### HILFSFUNKTIONEN FÜR DEN HAUPTLOOP ###
def wordEndTrunc(j):
    while (len(j)>3) and (j[-1] == j[-2] == j[-3]):
        j = j[:-1]
    return j
###               ####                ###

def testIngest(dict):
    print("Input Dictionary" + dict)

def ingest(dict):
    if dict["content"] == "":
        dict["content"] = ","
    msgColl.insert_one(dict)
    print("New message entry inserted into database.")
    
    flagged = 0
    if dict["label"] in range(1,8):
        flagged = 1
    
    print("Checking channel information:")
    
    if chnColl.count_documents({"channel": dict["channel"]}) > 0:
        print("\tChannel already found, updating records for channel: " + dict["channel"] + "\n")
        channel = chnColl.find_one({"channel": dict["channel"]})
        channel["numTotal"] += 1
        if flagged:
            channel["numFlagged"] += 1
        channel["flaggedRatio"] = channel["numFlagged"] / channel["numTotal"]
        channel[wordIndexes[dict["label"] + 3]] += 1
        
        labelNumList = [channel["noHate"], channel["negativeStereotyping"], channel["dehumanization"], channel["violenceKilling"], channel["equation"], channel["normalization"], channel["irony"], channel["harmfulSlanderGeneral"], channel["undetermined"]]
        maxFlag = [labelNumList[0]]
        maxFlag += [e * 20 for e in labelNumList[1:8]]
        maxFlag += [labelNumList[8]]
        channel["mostFlagged"] = maxFlag.index(max(maxFlag))
        
        chnColl.replace_one({"channel": {"$eq": dict["channel"]}}, channel)
    else:
        print("\tChannel not yet known, creating new entry for channel: " + dict["channel"] + "\n")
        chnInsertDict = {"channel": dict["channel"], "numTotal": 1, "numFlagged": flagged, "noHate": 0, "negativeStereotyping": 0, "dehumanization": 0, "violenceKilling": 0, "equation": 0, "normalization": 0, "irony": 0, "harmfulSlanderGeneral": 0, "undetermined": 0, "flaggedRatio": flagged, "mostFlagged": dict["label"]}
        chnInsertDict[wordIndexes[dict["label"] + 3]] += 1 # Hier kann auch wordIndexes genutzt werden, weil die Felder des Dictionaries bis auf den Key "word"/"channel" gleich sind und diese beiden an der gleichen Stelle stehen.
        chnColl.insert_one(chnInsertDict)
    
    print("Checking user records:")
        
    if usrColl.count_documents({"id": dict["authorId"]}) > 0:
        print("\tAuthor of message found, updating records for user: " + dict["authorName"] + "\n")
        user = usrColl.find_one({"id": dict["authorId"]})
        user["numTotal"] += 1
        if flagged:
            user["numFlagged"] += 1
        user["flaggedRatio"] = user["numFlagged"] / user["numTotal"]
        user[userIndexes[dict["label"] + 5]] += 1
        labelNumList = [user["noHate"], user["negativeStereotyping"], user["dehumanization"], user["violenceKilling"], user["equation"], user["normalization"], user["irony"], user["harmfulSlanderGeneral"], user["undetermined"]]
        maxFlag = [labelNumList[0]]
        maxFlag += [e * 20 for e in labelNumList[1:8]]
        maxFlag += [labelNumList[8]]
        user["mostFlagged"] = maxFlag.index(max(maxFlag))
        if dict["channel"] in user["channelInfo"].keys():
            prevChnInfo = user["channelInfo"][dict["channel"]]
            prevChnInfo[0] += 1
            prevChnInfo[1] += flagged
            prevChnInfo[dict["label"] + 2] += 1
            prevChnInfo[11] = prevChnInfo[1] / prevChnInfo[0]
            maxFlag = [prevChnInfo[0]]
            maxFlag += [e * 20 for e in prevChnInfo[3:10]]
            maxFlag += [prevChnInfo[10]]
            prevChnInfo[12] = maxFlag.index(max(maxFlag))
            user["channelInfo"][dict["channel"]] = prevChnInfo
        else:
            user["channelInfo"][dict["channel"]] = [1, flagged, 0, 0, 0, 0, 0, 0, 0, 0, 0, flagged, dict["label"]]
            user["channelInfo"][dict["channel"]][dict["label"] + 2] = 1
        usrColl.replace_one({"id": {"$eq": dict["authorId"]}}, user)
    else:
        print("\tAuthor not found, creating entry for new user: " + dict["authorName"] + "\n")
        usrInsertDict = {"id": dict["authorId"], "name": dict["authorName"], "isBot": int(dict["authorIsBot"]), "numTotal": 1, "numFlagged": flagged, "noHate": 0, "negativeStereotyping": 0, "dehumanization": 0 , "violenceKilling": 0, "equation": 0, "normalization": 0, "irony": 0, "harmfulSlanderGeneral": 0, "undetermined": 0, "flaggedRatio": flagged, "mostFlagged": dict["label"], "channelInfo": {dict["channel"]: [1, flagged, 0, 0, 0, 0, 0, 0, 0, 0, 0, flagged, dict["label"]]}}
        usrInsertDict["channelInfo"][dict["channel"]][dict["label"] + 2] = 1
        usrInsertDict[userIndexes[dict["label"] + 5]] = 1
        usrColl.insert_one(usrInsertDict)
    
    newWords = []
    oldWords = []
    print("Checking word content:")
    if (not validators.url(dict["content"])): # Falls die Nachricht eine URL ist, wird sie komplett übergangen, sonst ...
        l = re.split(r"[!…'’`´”“?,<>\s;/.:|@*#\\()\[\]{}\"_]", dict["content"].lower()) # ... wird die String in eine Liste einzelner Wörter aufgeteilt. Die split-Operation selbst entfernt dabei schon eine große Menge an Punktuation, Sonderzeichen und Kontraktionen der englischen Sprache.
        for i in l: # Alle Wörter der Nachricht werden einzeln durchgegangen
            if (i == "") or (i[0] in ["@", "/", "-", "_"]) or (i in ["gg", "re", "ve", "ll"]) or (len(i) >= 25) or ((len(i) == 1) and (i not in ["i", "a"])):
                    continue # Verschiedenste weitere Konditionen werden überprüft, ob das Wort in der Liste aufgeführt werden sollte. Symbole sind hier erneut aufgeführt, weil die split-Operation den ersten und letzten Buchstaben einer Nachricht nicht mit entfernt.
            i = wordEndTrunc(i) # Hier wird die oben definierte Rekursion angewandt.
            if rplColl.count_documents({"replaceWords": {"$all": [i]}}) > 0:
                i = rplColl.find_one({"replaceWords": {"$all": [i]}})["targetWord"]


            #check if word
            if wrdColl.count_documents({"word": i}) > 0:
                oldWords += [i]
                word = wrdColl.find_one({"word": i})
                word["numTotal"] += 1 # ... erhöhe die Zahl aller Nachrichten um 1 und ...
                if flagged: # ... falls es eine Hassnachricht war, erhöhe die Gesamtanzahl an Hassnachrichten um 1.
                    word["numFlagged"] += 1
                word[wordIndexes[dict["label"] + 3]] += 1 # Erhöhe die Anzahl an Nachrichten mit dem passenden Label um 1.
                word["flaggedRatio"] = word["numFlagged"] / word["numTotal"] # Berechne das Verhältnis aus Hassnachrichten und normalen Nachrichten.
                wrdLabelList = [word["noHate"], word["negativeStereotyping"], word["dehumanization"], word["violenceKilling"], word["equation"], word["normalization"], word["irony"], word["harmfulSlanderGeneral"], word["undetermined"]]
                word["mostFlagged"] = wrdLabelList.index(max(wrdLabelList)) # Die Berechnung des prominentesten Labels findet hier nur im direkten Vergleich der Hasslabels statt, da extrem viele Wörter aufgrund ihrer Häufigkeit in aller englischen Sprache auch bei extrem hohen Modifikatoren öfter in normalen als in Hassnachrichten auftreten würden.
                if dict["channel"] in word["channelInfo"].keys():
                    word["channelInfo"][dict["channel"]][0] += 1
                    word["channelInfo"][dict["channel"]][1] += flagged
                    word["channelInfo"][dict["channel"]][dict["label"] + 2] += 1
                    word["channelInfo"][dict["channel"]][11] = word["channelInfo"][dict["channel"]][1] / word["channelInfo"][dict["channel"]][0]
                    maxFlag = word["channelInfo"][dict["channel"]][2:11]
                    word["channelInfo"][dict["channel"]][12] = maxFlag.index(max(maxFlag))
                else:
                    word["channelInfo"][dict["channel"]] = [1, flagged, 0, 0, 0, 0, 0, 0, 0, 0, 0, flagged, dict["label"]]
                    word["channelInfo"][dict["channel"]][dict["label"] + 2] = 1
                wrdColl.replace_one({"word": {"$eq": i}}, word)
            else:
                print(i)
                newWords += [i]
                wrdInsertDict = {"word": i, 
                                 "numTotal": 1, 
                                 "numFlagged": flagged, 
                                 "noHate": 0, 
                                 "negativeStereotyping": 0, 
                                 "dehumanization": 0, 
                                 "violenceKilling": 0, 
                                 "equation": 0, 
                                 "normalization": 0, 
                                 "irony": 0, 
                                 "harmfulSlanderGeneral": 0, 
                                 "undetermined": 0, 
                                 "flaggedRatio": flagged, 
                                 "mostFlagged": dict["label"], 
                                 "channelInfo": {dict["channel"]: [1, flagged, 0, 0, 0, 0, 0, 0, 0, 0, 0, flagged, dict["label"]]}}
                wrdInsertDict["channelInfo"][dict["channel"]][dict["label"] + 2] = 1
                wrdInsertDict[wordIndexes[dict["label"] + 3]] += 1
                wrdColl.insert_one(wrdInsertDict)
                
    print("\tAll words iterated. Ingested " + str(len(newWords)) + " new words and updated records for " + str(len(oldWords)) + " words.\n\tNew words: " + str(newWords) + "\n")
    
    print("Message successfully ingested.\n")