import pymysql

host = "thing"
port = "number"
dbname = "name"
user = "user"
password = "pass"

class QuerySession():

    def __init__(self):
        self.conn = self.__get_connection__()

    def custom_query(self, query):

        cursor = self.conn.cursor()

        try:
            cursor.execute(query)
        except:
            print(f'QuerySession caught an error while trying to execute(({query}))')
            raise
        
        results = cursor.fetchall()

        self.conn.commit()

        cursor.close()

        return results
        

    def insert(self, data, field, table):
        
        if type(data) != list:
            data = [data]

        query = self.__get_insert_query__(data, field, table)

        cursor = self.conn.cursor()

        try:
            cursor.execute(query)
        except:
            print(f'QuerySession caught an error while trying to execute (({query}))')
            raise

        self.conn.commit()

        cursor.close()

    def select(self, selector, from_exp = '', where_exp = ''):

        if type(selector) != list:
            selector = [selector]

        query = self.__get_select_query__(selector)

        if len(from_exp) > 0:
            query = f'{query} FROM {from_exp}'

        if len(where_exp) > 0:
            query = f'{query} WHERE {where_exp}'

        cursor = self.conn.cursor()

        try:
            cursor.execute(query)
        except:
            print(f'QuerySession caught an error while trying to execute (({query}))')
            raise

        results = cursor.fetchall()

        self.conn.commit()

        cursor.close()

        return results


    def __get_connection__(self):
        try:
            return pymysql.connect(host, user=user,port=port, passwd=password, db=dbname)
        except:
            print(f'QuerySession caught an error while trying to establish a connection to {dbname}')
            raise
    

    def __get_insert_query__(self, data, field, table):
    
        query = f"INSERT INTO {table} ({field}) VALUES ("

        for datum in data:
            query = query + "'" + str(datum) + "'" + ','

        query = query[:len(query)-1] + ')'

        return query

    def __get_select_query__(self, selector):

        query = f"SELECT "

        for s in selector:
            query = query + str(s) + ','

        query = query[:len(query)-1]

        return query


if __name__ == '__main__':
    qs = QuerySession()
    qs.insert('klefstad', 'instructor', 'grade_distribution')
    results = qs.select("*", from_exp = "grade_distribution", where_exp= "instructor = 'Pattis'")
    for result in results:
        print(result)

        

        
