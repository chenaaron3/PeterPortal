from GradeDistributionSession import GradeDistributionSession

f = open('rows.txt')

data_list = []

for line in f:
    values = line.strip().split(';')
    if len(values) == 15:
        for i in [2,6,7,8,9,10,11,12,13]:
            values[i] = int(values[i])

        if values[14] == 'None':
            values[14] = -1.0
        else:
            values[14] = float(values[14])

        data_list.append(values)
    else:
        print(f"did not include {line}")

gds = GradeDistributionSession()

for line in data_list:
    print(line)

    gds.insert_row( \
     line[0],line[1],line[2],line[3],line[4],line[5], \
     line[6],line[7],line[8],line[9],line[10],line[11], \
     line[12],line[13],line[14])
