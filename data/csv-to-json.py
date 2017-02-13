import numbers
import json
import csv

with open('world_cities.csv') as f:
    next(f, None)
    reader = csv.reader(f)
    data = {}
    for row in reader:
        [country_code, country, province, city, population, latitude, longitude] = row

        if country_code not in data:
            data.update({
                country_code: {
                    "name": country,
                    "cities": []
                }
            })

        data[country_code]["cities"].append({
            "name": city,
            "province": province,
            "population": population,
            "latitude": latitude,
            "longitude": longitude
        })

    with open('world_cities.json', 'w') as outfile:
        json.dump(data, outfile, indent=4, sort_keys=True)
