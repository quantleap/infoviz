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


def load_country_temperatures(drop_staging_table=False):
    # load data from csv into dataframe
    df = pd.read_csv('./data/GlobalLandTemperatures/GlobalLandTemperaturesByCountry.csv')

    # filter and rename columns
    df = df[['dt', 'Country', 'AverageTemperature']]
    df.columns = ['date', 'country', 'avg_temp']

    # write staging data to database
    conn = sqlite3.connect('./data/climate.db')
    df.to_sql('staging_country_temperatures', conn, if_exists='replace', index=False)
    conn.commit()

    # drop and create country temperatures table, insert staging data
    conn.execute('''drop table if exists country_temperatures''')
    conn.execute('''create table country_temperatures
                    (year text, iso_code text, avg_temp real)''')

    conn.execute('''insert into country_temperatures
                      select strftime('%Y', [date]) as year, iso_code, avg(avg_temp) as avg_temp
                      from staging_country_temperatures as st
                      join dimension_country as dim on lower(st.country) = lower(dim.country)
                      group by year
                      ''')

    if drop_staging_table:
        conn.execute('''drop table staging_country_temperatures''')
    conn.commit()
    conn.close()


def load_country_co2(drop_staging_table=False):
    # load data from csv into dataframe
    df = pd.read_csv('./data/CAIT Country CO2 Emissions.csv', skiprows=1)

    # filter and rename columns
    # df = df[['dt', 'Country', 'AverageTemperature']]
    df.columns = ['country', 'year', 'co2_emission']

    # write staging data to database
    conn = sqlite3.connect('./data/climate.db')
    df.to_sql('staging_country_co2_emissions', conn, if_exists='replace', index=False)
    conn.commit()

    # drop and create country temperatures table, insert staging data
    conn.execute('''drop table if exists country_co2_emissions''')

    conn.execute('''create table country_co2_emissions
                    (year text, iso_code text, co2_emission real)''')

    conn.execute('''insert into country_co2_emissions
                      select year, iso_code, co2_emission
                      from staging_country_co2_emissions join dimension_country
                      on staging_country_co2_emissions.country = dimension_country.country''')

    if drop_staging_table:
        conn.execute('''drop table staging_country_co2_emissions''')
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
    #load_country_co2()
    # load_country_dimension_table()
    # load_city_avg_temperatures()