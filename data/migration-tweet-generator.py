import random
import json
import timestamp

TWEET_COUNT = 1000

def random_city(data):
  country_code = random.choice(list(data.keys()))
  country = data[country_code]['name']
  city = random.choice(data[country_code]['cities'])
  city.update({ 'city': city['name'] })
  city.update({ 'country': country })
  city.update({ 'country_code': country_code })
  return city

def random_name(names):
  first = random.choice(list(names['first_name']))
  last = random.choice(list(names['last_name']))
  return {
    'name': '%s %s' % (first, last),
    'username': '%s%s' % (first[0], last)
  }

def random_tweet():
 return random.choice([
    "I'm sick of %s, %s, moving to %s, %s!",
    "Leaving %s, %s behind. %s, %s is what I'll call home.",
    "Goodbye %s, %s, hello %s, %s."
  ])

tweets = []
now = int(round(timestamp.timestamp() * 1000))

with open('world_cities.json', 'r') as f:
  cities = json.loads(f.read())

with open('names.json', 'r') as f:
  names = json.loads(f.read())

for n in range(TWEET_COUNT):
    user = random_name(names)
    source = random_city(cities)
    destination = random_city(cities)
    message = random_tweet() % (source['city'], source['country'], destination['city'], destination['country'])

    tweets.append({
        "source": {
            "country_code": source['country_code'],
            "country": source['country'],
            "latitude": source['latitude'],
            "longitude": source["longitude"]
        },
        "destination": {
            "country_code": destination['country_code'],
            "country": destination['country'],
            "latitude": destination['latitude'],
            "longitude": destination["longitude"]
        },
        "tweet": message,
        "name": user['name'],
        "username": user['username'],
        "timestamp": now
    })

    now = now + random.choice(range(5 * 60)) * 1000

tweets.sort(key=lambda t: t['timestamp'])

with open('tweets.json', 'w') as outfile:
    json.dump(tweets, outfile, indent=4, sort_keys=False)
