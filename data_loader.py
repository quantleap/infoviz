import pandas as pd
import sqlite3


def load_city_avg_temperature():
    # load data from csv into dataframe
    df = pd.read_csv('./data/GlobalLandTemperatures/GlobalLandTemperaturesByMajorCity.csv')

    # filter and rename columns
    df = df[['dt', 'City', 'AverageTemperature']]
    df.columns = ['date', 'city', 'avg_temperature']

    # write to database
    conn = sqlite3.connect('./data/climate.db')
    df.to_sql('city', conn, if_exists='replace', index=False, index_label=['date', 'city'])
    conn.close()


if __name__ == '__main__':
    load_city_avg_temperature()