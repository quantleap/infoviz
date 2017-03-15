import pandas as pd
import sqlite3


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


def load_country_temperatures():
    # load data from csv into dataframe
    df = pd.read_csv('./data/GlobalLandTemperatures/GlobalLandTemperaturesByCountry.csv')

    # filter and rename columns
    df = df[['dt', 'Country', 'AverageTemperature']]
    df.columns = ['date', 'country', 'avg_temp']

    # write staging data to database
    conn = sqlite3.connect('./data/climate.db')
    df.to_sql('staging_country_temperatures', conn, if_exists='replace', index=False, index_label=['date', 'country'])
    conn.commit()

    # drop and create country temperatures table, insert staging data
    conn.execute('''drop table if exists country_temperatures''')
    conn.execute('''create table country_temperatures
                    (date text, iso_code text, avg_temp real)''')
    conn.execute('''insert into country_temperatures
                      select [date], iso_code, avg_temp
                      from staging_country_temperatures join dimension_country
                      on staging_country_temperatures.country = dimension_country.country''')
    conn.execute('''drop table staging_country_temperatures''')
    conn.commit()
    conn.close()


def load_country_dimension_table():
    # load data from Excel into dataframe
    df = pd.read_excel('./data/countries.xlsx', sheetname='export')

    # filter and rename columns
    df = df[['Code_Lower', 'Name', 'Continent', 'Population', 'Area', 'Coastline']]
    df.columns = ['iso_code', 'country', 'continent', 'population', 'area', 'coastline']

    # write to database
    conn = sqlite3.connect('./data/climate.db')
    df.to_sql('dimension_country', conn, if_exists='replace', index=False, index_label=['iso_code'])
    conn.close()


if __name__ == '__main__':
    load_country_temperatures()
    # load_country_dimension_table()
    # load_city_avg_temperatures()