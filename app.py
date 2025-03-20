from fastapi import *
from fastapi.middleware.cors import CORSMiddleware
import json
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import mysql.connector
def connect_mysql():
	return  mysql.connector.connect( user="root",password="newPassword1234!", host="localhost", database="taipei_day_trip")
app= FastAPI()
app.mount("/", StaticFiles(directory="static",html=True), name="static")
app.add_middleware(
	CORSMiddleware,allow_origins=["http://52.192.22.142:8000/"],
	allow_credentials=True, 
	allow_methods=["*"], 
	allow_headers=["*"]
)
@app.get("/api/attractions")
def attractions(page: int, keyword:str=None):
	try:
		con= connect_mysql()
		cursor= con.cursor(dictionary=True)
		limit=12
		offset=page* limit
		if keyword:
			cursor.execute("SELECT a.id, a.name, a.category, a.description, a.address, a.transport, a.mrt, a.lat, a.lng, GROUP_CONCAT(i.url) as images FROM attractions a LEFT JOIN imgs i ON a.id = i.attraction_id WHERE a.name LIKE %s or a.mrt LIKE %s GROUP BY a.id LIMIT %s OFFSET %s",(f"%{keyword}%", f"%{keyword}%", limit+1, offset))
		else:
			cursor.execute("SELECT a.id, a.name, a.category, a.description, a.address, a.transport, a.mrt, a.lat, a.lng, GROUP_CONCAT(i.url) as images FROM attractions a LEFT JOIN imgs i ON a.id = i.attraction_id GROUP BY a.id LIMIT %s OFFSET %s",(limit+1, offset))
		result = cursor.fetchall()
		data = []
		if len(result) > limit:
			next_page = page + 1
			result = result[:limit]
		else:
			next_page = None
		for r in result:
			if r["images"]:
				images= r["images"].split(",")
			else:
				images=[]
			data.append({
				"id": r["id"],
				"name": r["name"] ,
				"category": r["category"] ,
				"description": r["description"],
				"address": r["address"],
				"transport": r["transport"] ,
				"mrt": r["mrt"] ,
				"lat": r["lat"],
				"lng": r["lng"],
				"images": images 
	 			}
			)
		return JSONResponse(content={"nextPage": next_page,"data": data},media_type="application/json; charset=utf-8")
	except Exception as e:
		raise HTTPException(status_code=500, detail={
			"error":True,
			"message":str(e)
		})	
	finally:
		cursor.close()
		con.close()

@app.get("/api/attraction/{attractionId}")
def attraction(attractionId:int):
	try:
		con = connect_mysql()
		cursor = con.cursor(dictionary=True)
		cursor.execute("SELECT * FROM attractions WHERE id= %s",(attractionId,))
		result= cursor.fetchone()
		if result is None:
			raise HTTPException(status_code=400, detail={
			"error": True,
			"message": 	"無此景點編號"
		})
		cursor.execute("SELECT url FROM imgs WHERE attraction_id= %s",(attractionId,))
		imgs=[]
		for img_data in cursor.fetchall():
			imgs.append(img_data["url"])
		data={
			"id":result["id"],
			"name":result["name"],
			"category":result["category"],
			"description":result["description"],
			"address":result["address"],
			"transport":result["transport"],
			"mrt":result["mrt"],
			"lat":result["lat"],
			"lng":result["lng"],
			"imgs":imgs
		}
		return JSONResponse(content={"data":data},media_type="application/json; charset=utf-8")
	except Exception as e:
		raise HTTPException(status_code=500,detail={
			"error": True,
			"message": 	str(e)
		})
	finally:
		cursor.close()
		con.close()

@app.get("/api/mrts")
def mrt():
	try:
		con = connect_mysql()
		cursor = con.cursor(dictionary=True)
		cursor.execute("SELECT mrt, COUNT(*) from attractions WHERE mrt is not null GROUP BY mrt ORDER BY COUNT(*) desc")
		result= cursor.fetchall()
		data=[]
		for r in result:
			data.append(r["mrt"])
		return JSONResponse(content={"data":data},media_type="application/json; charset=utf-8")
	except Exception as e:
		raise HTTPException(status_code=500, detail={
			"error": True,
			"message": str(e)
		})
	finally:		
		cursor.close()
		con.close()		
# Static Pages (Never Modify Code in this Block)
@app.get("/", include_in_schema=False)
async def index(request: Request):
	return FileResponse("./static/index.html", media_type="text/html")
@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
	return FileResponse("./static/attraction.html", media_type="text/html")
@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
	return FileResponse("./static/booking.html", media_type="text/html")
@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
	return FileResponse("./static/thankyou.html", media_type="text/html")