from flask import Flask
from flask_restful import Resource, Api
from sqlalchemy import create_engine

app = Flask(__name__)
api = Api(app)

e = create_engine('sqlite:///./data/climate.db')


class City(Resource):
    def get(self, city):
        conn = e.connect()
        query = conn.execute("select date, avg_temperature from city where city = :city order by date desc", city=city)
        return {'city': city, 'avg_temperatures': [{'date': r[0], 'avg_temp': r[1]} for r in query.cursor.fetchall()]}


api.add_resource(City, '/city/<string:city>')

if __name__ == '__main__':
    app.run(debug=True)
