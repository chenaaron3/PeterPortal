import json
import pyperclip

# Script to convert messy JSON format to a readable one for documentation.
# HOW TO USE:
# 1. Paste the order of JSON keys in keyOrder list
# 2. Paste the JSON generated from Scraper.py
# 3. Run python docJSON.py

courseKeyOrder = ["id", "id_number", "id_department", "id_school", "department", "name", "description", "dept_alias", "course_level",
            "prerequisite", "prerequisiteList", "prerequisiteJSON", "dependencies", "professorHistory",
            "repeatability", "corequisite", "overlaps", "restriction", "concurrent", "units", "same as", "grading option", 
            "ge_string", "ge_types"]

professorKeyOrder = ["ucinetid", "name", "title", "department", "phone", "relatedDepartments", "courseHistory"]

keyOrder = courseKeyOrder

messyJSON = """
{"id": "AFAM 50", "id_department": "AFAM", "id_number": "50", "id_school": "School of Humanities", "name": "Introductory Topics in African American Studies", "course_level": "Lower Division (1-99)", "dept_alias": [], "units": [4.0, 4.0], "description": "Introduction to a broad range of topics in African American studies, exploring history, literature, art, culture, politics, and contemporary social issues. Topical organization of courses addresses issues that have been of importance historically and are reshaping the African diaspora today.", "department": "African American Studies", "professorHistory": [], "prerequisiteJSON": "", "prerequisiteList": [], "prerequisite": "", "dependencies": [], "repeatability": " unlimited as topics vary.", "grading option": "", "concurrent": "", "same as": "", "restriction": "", "overlaps": "", "corequisite": "", "ge_types": [], "ge_string": ""}
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