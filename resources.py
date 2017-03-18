from flask.ext.restful import Resource


def get_country_by_iso(conn, iso_code):
    return conn.execute('''select country from dimension_country where iso_code=:iso_code''',
                        iso_code=iso_code).cursor.fetchone()[0]


class City(Resource):
    def get(self, city):
        conn = e.connect()
        query = conn.execute('''select date, avg_temperature from city where city = :city order by date desc''',
                             city=city)
        return {'city': city, 'temperatures': [{'date': r[0],
                                                'avg_temp': r[1]} for r in query.cursor.fetchall()]}


class Country(Resource):
    def get(self, iso_code):
        conn = e.connect()
        query_result = conn.execute('''select country, continent, population, area, coastline
                                       from dimension_country where iso_code = :iso_code''',
                                    iso_code=iso_code).cursor.fetchone()
        if query_result:
            return {'iso_code': iso_code,
                    'country': query_result[0],
                    'continent': query_result[1],
                    'population': query_result[2],
                    'area': query_result[3],
                    'coastline': query_result[4]}
        else:
            return {'iso_code': iso_code,
                    'country': 'unknown'}


class CountryTemperatures(Resource):
    def get(self, iso_code):
        conn = e.connect()
        query_result = conn.execute('''select year, avg_temp
                                       from country_temperatures
                                       where iso_code = :iso_code''',
                                    iso_code=iso_code).cursor.fetchall()

        return {'country': get_country_by_iso(conn, iso_code),
                'iso_code': iso_code,
                'temperatures': [{'year': r[0],
                                  'avg_temp': r[1]} for r in query_result]}


class CountryCO2Emissions(Resource):
    def get(self, iso_code):
        conn = e.connect()
        query_result = conn.execute('''select year, co2_emission
                                       from country_co2_emissions
                                       where iso_code = :iso_code''',
                                    iso_code=iso_code).cursor.fetchall()

        return {'country': get_country_by_iso(conn, iso_code),
                'iso_code': iso_code,
                'co2_emissions': [{'year': r[0],
                                   'co2_emission': r[1]} for r in query_result]}



