from GradeDistributionSession import GradeDistributionSession

f = open('rows')

data_list = []

for line in f:
    values = line.strip().split(',')
    if len(values) == 15:
        #values[0] = values[0][2:]
        for i in [0, 1, 3, 4, 5]:
            values[i] = values[i][:len(values[i])-1]
            values[i] = values[i][2:]
            values[i].strip()
        values[2] = values[2][1:]
        values[14] = values[14][1:len(values[14])-1]
        if values[14] == 'None':
            values[14] = -1
        data_list.append(values)
    else:
        print(f"did not include {line}")

gds = GradeDistributionSession()

'''for line in data_list:
    print(line)'''

for line in data_list:
    gds.insert_row( \
     line[0],line[1],line[2],line[3],line[4],line[5], \
     line[6],line[7],line[8],line[9],line[10],line[11], \
     line[12],line[13],line[14])
