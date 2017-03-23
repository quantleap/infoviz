import sqlite3
import wbdata


def create_indicator_table(con):
    cur = con.cursor()
    try:
        cur.execute('''drop table if exists country_annual_indicators''')
        cur.execute('''create table country_annual_indicators
                       (year text, iso_code text)''')
        con.commit()
    except sqlite3.OperationalError:
        pass


def load_indicator(con, indicator, db_column_name):
    cur = con.cursor()

    # add column if not exists
    try:
        cur.execute('''alter table country_annual_indicators
                       add column {} real'''.format(db_column_name))
        con.commit()
    except sqlite3.OperationalError:
        pass

    # try to update, otherwise insert
    indicator_value_items = wbdata.get_data(indicator)
    for item in indicator_value_items:
        cur.execute('''update country_annual_indicators
                       set {}=?
                       where iso_code=? and year=?'''.format(db_column_name),
                    (item['value'],
                     item['country']['id'].lower(),
                     item['date']))

        # If no update happened (i.e. the row didn't exist) then insert one
        cur.execute('''INSERT INTO country_annual_indicators ('iso_code', 'year', {})
                       SELECT ?, ?, ?
                       WHERE (Select Changes() = 0)'''.format(db_column_name),
                    (item['country']['id'].lower(),
                     item['date'],
                     item['value']))
    con.commit()

if __name__ == "__main__":
    con = sqlite3.connect('./climate.db')
    create_indicator_table(con)
    load_indicator(con, 'SP.POP.TOTL', 'population')
    load_indicator(con, 'EN.ATM.CO2E.KT', 'co2_emission_total')
    load_indicator(con, 'EN.ATM.CO2E.PC', 'co2_emission_per_capita')
