import json
import mysql.connector
con = mysql.connector.connect(
    user="root",password="newPassword1234!", host="localhost", database="taipei_day_trip")
cursor= con.cursor()
def img_filter(imgstr):
	urls=imgstr.split("https://")
	filtered_urls=[]
	for url in urls:
		if url.lower().endswith((".jpg",".png")):
			filtered_urls.append("https://"+url)
	return filtered_urls
def insert_attraction_data(data):
	value=(
		data.get("name"),
		data.get("CAT"),
		data.get("description"),
		data.get("address"),
		data.get("direction"),
		data.get("MRT"),
		float(data.get("latitude")),
		float(data.get("longitude")),
	)
	try:
		cursor.execute("INSERT INTO attractions(name, category, description, address, transport, mrt, lat, lng)VALUES( %s, %s, %s, %s, %s, %s, %s, %s)", value)
		attraction_id=cursor.lastrowid
		img_urls=img_filter(data.get("file", ""))
		for url in img_urls:
			cursor.execute("INSERT INTO imgs(attraction_id, url)VALUES(%s, %s)",(attraction_id, url))
		con.commit()
	except Exception as e :
		con.rollback()
		print(f"資料有誤:{e}")

with open("./data/taipei-attractions.json", "r", encoding="utf-8") as file:
    data = json.load(file)	
for d in data["result"]["results"]:
	insert_attraction_data(d)
print("資料已插入資料庫")
cursor.close()
con.close()