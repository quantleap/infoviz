from flask import Flask
from flask_restful import Api
from flask import render_template
from resources import City, Country, CountryTemperatures, CountryCO2Emissions


app = Flask(__name__)
api = Api(app)

# HTML


@app.route('/')
def homepage():
    return render_template('index.html')


# API
api.add_resource(City, '/city/<string:city>')
api.add_resource(Country, '/country/<string:iso_code>')
api.add_resource(CountryTemperatures, '/country/<string:iso_code>/temperatures')
api.add_resource(CountryCO2Emissions, '/country/<string:iso_code>/co2_emissions')

if __name__ == '__main__':
    app.run(debug=True)
