from flask import Flask
from flask_restful import Api
from flask import render_template
from resources import *

app = Flask(__name__)
api = Api(app)

# HTML


@app.route('/')
def homepage():
    return render_template('index.html')


@app.route('/introduction')
def introduction():
    return render_template('introduction.html')


# API
api.add_resource(City, '/city/<string:city>')
api.add_resource(Country, '/country/<string:iso_code>')
api.add_resource(CountryAnnualTemperatures, '/country/<string:iso_code>/annual_temperatures')  # ?begin=2000&end=2010
api.add_resource(CountryMonthlyTemperatures, '/country/<string:iso_code>/monthly_temperatures')
api.add_resource(CountryIndicators, '/country/<string:iso_code>/indicators')
api.add_resource(TemperatureComparison, '/temp_comparison/<string:begin_year>/<string:end_year>')
api.add_resource(YearOnYearChangeDistribution,
                 '/temp_change_distribution/<string:begin_year>/<string:end_year>/<string:iso_code>')


if __name__ == '__main__':
    app.run(debug=True)
