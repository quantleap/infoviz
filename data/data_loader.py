import pandas as pd
import sqlite3
import logging

logger = logging.getLogger(__name__)


def load_city_temperatures():
    # load data from csv into dataframe
    df = pd.read_csv('./data/GlobalLandTemperatures/GlobalLandTemperaturesByMajorCity.csv')

    # filter and rename columns
    df = df[['dt', 'City', 'AverageTemperature']]
    df.columns = ['date', 'city', 'avg_temperature']

    # write staging data to database
    conn = sqlite3.connect('./data/climate.db')
    df.to_sql('staging_city', conn, if_exists='replace', index=False, index_label=['date', 'city'])
    conn.commit()
    conn.close()


def load_country_temperatures(drop_staging_table=False):
    logging.info('load country temperature table')

    # load data from csv into dataframe
    df = pd.read_csv('./data/GlobalLandTemperatures/GlobalLandTemperaturesByCountry.csv')

    # filter and rename columns
    df = df[['dt', 'Country', 'AverageTemperature']]
    df.columns = ['date', 'country', 'avg_temp']

    # write staging data to database
    con = sqlite3.connect('./data/climate.db')
    df.to_sql('staging_country_temperatures', con, if_exists='replace', index=False, index_label='country')

    # drop and create country temperatures table, insert staging data
    cur = con.cursor()
    cur.execute('''drop table if exists country_temperatures''')
    cur.execute('''create table country_temperatures
                    (year text, iso_code text, avg_temp real)''')

    cur.execute('''insert into country_temperatures
                      select strftime('%Y', [date]) as year, iso_code, avg(avg_temp) as avg_temp
                      from staging_country_temperatures as st
                      join dimension_country as dim on lower(st.country) = lower(dim.country)
                      group by year
                      ''')

    if drop_staging_table:
        cur.execute('''drop table staging_country_temperatures''')


def load_country_co2(drop_staging_table=False):
    logging.info('load country c02 emission  table')

    # load data from csv into dataframe
    df = pd.read_csv('./data/CAIT Country CO2 Emissions.csv', skiprows=1)

    # filter and rename columns
    # df = df[['dt', 'Country', 'AverageTemperature']]
    df.columns = ['country', 'year', 'co2_emission']

    # write staging data to database
    con = sqlite3.connect('./data/climate.db')
    df.to_sql('staging_country_co2_emissions', con, if_exists='replace', index=False, index_label='country')

    # drop and create country temperatures table, insert staging data
    cur = con.cursor()
    cur.execute('''drop table if exists country_co2_emissions''')

    cur.execute('''create table country_co2_emissions
                    (year text, iso_code text, co2_emission real)''')

    cur.execute('''insert into country_co2_emissions
                      select year, iso_code, co2_emission
                      from staging_country_co2_emissions as st join dimension_country as dim
                      on lower(st.country) = lower(dim.country)''')

    if drop_staging_table:
        cur.execute('''drop table staging_country_co2_emissions''')


def load_country_dimension_table():
    logging.info('load country dimension table')
    # load data from Excel into dataframe
    df = pd.read_excel('./data/countries.xlsx', sheetname='export')

    # write to database
    con = sqlite3.connect('./data/climate.db')

    # drop and create table, insert data
    cur = con.cursor()
    cur.execute('''drop table if exists dimension_country''')
    df.to_sql('dimension_country', con, if_exists='replace', index=False, index_label='iso_code')


if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)

    load_country_dimension_table()
    #load_country_temperatures()
    #load_country_co2()
    # load_city_avg_temperatures()