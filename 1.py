import requests
import json

API_KEY ='fWO5k2rBS51h6fWYgeEcE3ctbuMtEalgBCEcyRUP'

url = "https://api.si.edu/openaccess/api/v1.0/search"

params = {
    "q": "Apollo AND unit_code:NASM AND online_media_type:Images",
    "api_key": API_KEY,
    "rows": 20
}

print("Searching Smithsonian...")

response = requests.get(url, params=params)

print("Status code:", response.status_code)

if response.status_code != 200:
    print("Error:")
    print(response.text)
    exit()

data = response.json()

results = data.get("response", {}).get("rows", [])

print("Results found:", len(results))

for item in results:
    print("\n-----------------------------")
    print("ID:", item.get("id"))
    print("Title:", item.get("title"))
    print("URL:", item.get("url"))