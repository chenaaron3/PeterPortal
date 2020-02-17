import json
import pyperclip

# script to convert messy JSON format to a readable one for documentation
keyOrder = ["id", "id_number", "id_department", "department", "name", "description", "dept_alias", 
            "prerequisite", "prerequisiteList", "prerequisiteJSON", "dependencies", 
            "repeatability", "corequisite", "overlaps", "restriction", "concurrent", "units", "same as", "grading option", 
            "ge_string", "ge_types"]

messyJSON = """
{"id": "COMPSCI 178", "prerequisiteJSON": "{AND:['I&C SCI 6B','I&C SCI 6D',{OR:['I&C SCI 6N','MATH 3A']},'MATH 2B',{OR:['STATS 67',{AND:['STATS 7','STATS 120A']}]}]}", "concurrent": "", "overlaps": "", "department": "Computer Science", "corequisite": "", "dependencies": ["COMPSCI 272", "COMPSCI 172B", "COMPSCI 274C", "STATS 170A", "COMPSCI 117", "COMPSCI 175"], "description": "Introduction to principles of machine learning and data-mining applied to real-world datasets. Typical applications include spam filtering, object recognition, and credit scoring.", "ge_string": "", "dept_alias": ["CS"], "same as": "", "restriction": "Restriction: School of Info & Computer Sci students have first consideration for enrollment. Computer Science Engineering Majors have first consideration for enrollment.", "id_department": "COMPSCI", "prerequisite": "Prerequisite: I&C SCI 6B and I&C SCI 6D and (I&C SCI 6N or MATH 3A) and MATH 2B and (STATS 67 or (STATS 7 and STATS 120A))", "id_number": "178", "grading option": "", "units": [4.0, 4.0], "prerequisiteList": ["I&C SCI 6B", "I&C SCI 6D", "I&C SCI 6N", "MATH 3A", "MATH 2B", "STATS 67", "STATS 7", "STATS 120A"], "name": "Machine Learning and Data-Mining", "repeatability": "", "ge_types": []}
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