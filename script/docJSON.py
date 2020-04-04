import json
import pyperclip

# Script to convert messy JSON format to a readable one for documentation.
# HOW TO USE:
# 1. Paste the order of JSON keys in keyOrder list
# 2. Paste the JSON generated from Scraper.py
# 3. Run python docJSON.py

keyOrder = ["id", "id_number", "id_department", "id_school", "department", "name", "description", "dept_alias", "course_level",
            "prerequisite", "prerequisiteList", "prerequisiteJSON", "dependencies", 
            "repeatability", "corequisite", "overlaps", "restriction", "concurrent", "units", "same as", "grading option", 
            "ge_string", "ge_types"]

messyJSON = """
{"dept_alias": ["CS"], "repeatability": "", "id_department": "COMPSCI", "concurrent": "", "id_number": "178", "id": "COMPSCI 178", "grading option": "", "name": "Machine Learning and Data-Mining", "course_level": "Upper Division (100-199)", "overlaps": "", "units": [4.0, 4.0], "id_school": "Donald Bren School of Information and Computer Sciences", "prerequisite": "Prerequisite: I&C SCI 6B and I&C SCI 6D and (I&C SCI 6N or MATH 3A) and MATH 2B and (STATS 67 or (STATS 7 and STATS 120A))", "ge_string": "", "corequisite": "", "dependencies": ["STATS 170A", "COMPSCI 274C", "COMPSCI 172B", "COMPSCI 117", "COMPSCI 175", "COMPSCI 272"], "department": "Computer Science", "prerequisiteJSON": "{AND:['I&C SCI 6B','I&C SCI 6D',{OR:['I&C SCI 6N','MATH 3A']},'MATH 2B',{OR:['STATS 67',{AND:['STATS 7','STATS 120A']}]}]}", "same as": "", "description": "Introduction to principles of machine learning and data-mining applied to real-world datasets. Typical applications include spam filtering, object recognition, and credit scoring.", "restriction": "Restriction: School of Info & Computer Sci students have first consideration for enrollment. Computer Science Engineering Majors have first consideration for enrollment.", "ge_types": [], "prerequisiteList": ["I&C SCI 6B", "I&C SCI 6D", "I&C SCI 6N", "MATH 3A", "MATH 2B", "STATS 67", "STATS 7", "STATS 120A"]}
"""

# convert string to dictionary
dic = json.loads(messyJSON)
# check if all keys are matching
dicKeySet = set(dic.keys())
keyOrderSet = set(keyOrder)
if dicKeySet != keyOrderSet:
    print("KEYORDER DOES NOT MATCH JSON KEYS!!")
    if len(dicKeySet) > len(keyOrderSet):
        print("MISSING", dicKeySet - keyOrderSet, "FROM KEYORDER!!")
    elif len(dicKeySet) < len(keyOrderSet):
        print("MISSING", keyOrderSet - dicKeySet, "FROM JSON!!")
    else:
        print("KEYORDER HAS:", keyOrderSet - dicKeySet)
        print("JSON HAS:", dicKeySet - keyOrderSet)
# all keys are present and matching
else:
    # PATTIS WOULD BE PROUD
    cleanJSON = ("{" + "\n".join(("{!r}: {!r}".format(keyOrder[i], dic[keyOrder[i]]) + ("," if i != len(keyOrder) - 1 else "")) for i in range(len(keyOrder))) + "}")
    print(cleanJSON)
    # try to copy to keyboard
    try:
        pyperclip.copy(cleanJSON)
        print("COPIED TO CLIPBOARD!!")
    except:
        print("FAILED TO COPY TO CLIPBOARD")
        print("MAKE SURE TO 'pip install pyperclip'")