from flask_restful import Resource
from sqlalchemy import create_engine

engine = create_engine('sqlite:///./data/climate.db')
from flask_restful import reqparse

parser = reqparse.RequestParser()


def get_country_by_iso(conn, iso_code):
    return conn.execute('''select country from dimension_country where iso_code=:iso_code''',
                        iso_code=iso_code).cursor.fetchone()[0]


class City(Resource):
    def get(self, city):
        conn = engine.connect()
        query = conn.execute('''select date, avg_temperature from city where city = :city order by date desc''',
                             city=city)
        return {'city': city, 'temperatures': [{'date': r[0],
                                                'avg_temp': r[1]} for r in query.cursor.fetchall()]}


class Country(Resource):
    def get(self, iso_code):
        conn = engine.connect()
        query_result = conn.execute('''select country, population, area, coastline
                                       from dimension_country where iso_code = :iso_code''',
                                    iso_code=iso_code).cursor.fetchone()
        if query_result:
            return {'iso_code': iso_code,
                    'country': query_result[0],
                    'population': query_result[1],
                    'area': query_result[2],
                    'coastline': query_result[3]}
        else:
            return {'iso_code': iso_code,
                    'country': 'unknown'}


class CountryMonthlyTemperatures(Resource):
    def get(self, iso_code):
        parser.add_argument('begin', type=int, location='args')
        parser.add_argument('end', type=int, location='args')
        args = parser.parse_args()

        conn = engine.connect()
        query_result = conn.execute('''select month, avg_temp
                                       from country_monthly_temperatures
                                       where iso_code = :iso_code and
                                         (cast(substr(month, 1, 4) as real) >= :begin or :begin is null) AND
                                         (cast(substr(month, 1, 4) as real) <= :end or :end is null)''',
                                    iso_code=iso_code,
                                    begin=args['begin'],
                                    end=args['end']).cursor.fetchall()

        return {'country': get_country_by_iso(conn, iso_code),
                'iso_code': iso_code,
                'temperatures': [{'month': r[0],
                                  'avg_temp': r[1]} for r in query_result]}


class CountryAnnualTemperatures(Resource):
    def get(self, iso_code):
        parser.add_argument('begin', type=int, location='args')
        parser.add_argument('end', type=int, location='args')
        args = parser.parse_args()

        conn = engine.connect()
        query_result = conn.execute('''select year, avg_temp, yoy_change_avg_tmp
                                       from country_annual_temperatures
                                       where iso_code = :iso_code and
                                         (year >= :begin or :begin is null) AND
                                         (year <= :end or :end is null)''',
                                    iso_code=iso_code,
                                    begin=args['begin'],
                                    end=args['end']).cursor.fetchall()

        return {'country': get_country_by_iso(conn, iso_code),
                'iso_code': iso_code,
                'temperatures': [{'year': r[0],
                                  'avg_temp': r[1],
                                  'yoy_change_avg_temp': r[2]
                                  } for r in query_result]}


class CountryIndicators(Resource):
    def get(self, iso_code):
        parser.add_argument('begin', type=int, location='args')
        parser.add_argument('end', type=int, location='args')
        args = parser.parse_args()

        conn = engine.connect()
        query_result = conn.execute('''select year,
                                              population,
                                              co2_emission_total,
                                              co2_emission_per_capita
                                       from country_annual_indicators
                                       where iso_code = :iso_code and
                                         (year >= :begin or :begin is null) AND
                                         (year <= :end or :end is null)''',
                                    iso_code=iso_code,
                                    begin=args['begin'],
                                    end=args['end']).cursor.fetchall()

        return {'country': get_country_by_iso(conn, iso_code),
                'iso_code': iso_code,
                'indicators': [{'year': r[0],
                                'population': r[1],
                                'co2_emission_total': r[2],
                                'co2_emission_per_capita': r[3]} for r in query_result]}



