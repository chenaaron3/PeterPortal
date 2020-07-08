from QuerySession import QuerySession

class GradeDistributionSession(QuerySession):

    def __init__(self):
        QuerySession.__init__(self)

    def insert(self, data, field):
        QuerySession.insert(data, field, 'grade_distribution')

    def select(self, selector, where_exp = ''):
        QuerySession.insert(selector, 'grade_distribution', where_exp = '')

    def insert_row(self, AcadTerm='', courseID='', courseCode='', sectionNum='', instructor='', classType='',
                   gradeACount='', gradeBCount='', gradeCCount='', gradeDCount='', gradeFCount='',
                   gradePCount='', gradeNPCount='', gradeWCCount='', gradedGPAAvg=''):

        QuerySession.custom_query(self, f'INSERT INTO grade_distribution VALUES ( \
        "{AcadTerm}", "{courseID}", {courseCode}, "{sectionNum}", "{instructor}", "{classType}", \
        {gradeACount}, {gradeBCount}, {gradeCCount}, {gradeDCount}, {gradeFCount}, \
        {gradePCount}, {gradeNPCount}, {gradeWCCount}, {gradedGPAAvg})')

# INSERT INTO grade-distribution (AcadTerm, courseID, courseCode, sectionNum, instructor, classType, gradeACount, gradeBCount, gradeCCount, gradeDCount, gradeFCount, gradePCount, gradeNPCount, gradeWCount, gradedGPAAvg)
# VALUES ("Spring 2020", "I&CSCI33", 36620, "A", "PATTIS, R.", "LEC", 125, 72, 31, 16, 33, 1, 0, 1, 2.84);

if __name__ == '__main__':
    gds = GradeDistributionSession()
    gds.insert_row("Spring 2020", "I&CSCI33", 36620, "A", "PATTIS, R.", "LEC", 125, 72, 31, 16, 33, 1, 0, 1, 2.84);

# user: mank
# pass: iK2@v^J|SvJ[
