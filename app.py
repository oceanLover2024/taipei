import os
from  dotenv import load_dotenv
from datetime import datetime,timezone,timedelta, date
from fastapi import *
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
import jwt
import mysql.connector
from mysql.connector.pooling import MySQLConnectionPool
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
import requests
load_dotenv()
partner_key=os.getenv("partner_key")
merchant_id=os.getenv("merchant_id")
my_pool = MySQLConnectionPool(
    host="127.0.0.1",
    user="root",
    password=os.getenv("password"),
    database="taipei_day_trip",
    pool_size=10,
    pool_reset_session=True
)

def connect_mysql():
    return my_pool.get_connection()
app= FastAPI()
app.mount("/static", StaticFiles(directory="static",html=False), name="static")
app.add_middleware(
	CORSMiddleware,allow_origins=["*"],
	allow_credentials=True, 
	allow_methods=["*"], 
	allow_headers=["*"]
)
bearer_tool=HTTPBearer()
password_tool=CryptContext(schemes=['bcrypt'],deprecated='auto')
ALGORITHM="HS256"
secret_key=os.getenv("secret_key")
def create_token(data:dict):
	to_encode=data.copy()
	expire=datetime.now(timezone.utc)+timedelta(days=7)
	to_encode.update({"exp":expire})
	return jwt.encode(to_encode,secret_key,algorithm=ALGORITHM)
def verify_token(c:HTTPAuthorizationCredentials=Depends(bearer_tool)):
	token=c.credentials	
	try:
		return jwt.decode(token,secret_key,algorithms=[ALGORITHM])
	except jwt.ExpiredSignatureError:
		raise HTTPException(status_code=401,detail="token過期")
	except jwt.InvalidTokenError:
		raise HTTPException(status_code=401,detail="token無效")
class Signin(BaseModel):
	email:EmailStr
	password:str
class Register(BaseModel):
	name:str
	email:EmailStr
	password:str
class CreateBooking(BaseModel):
	attractionId:int
	date:date
	time:str
	price:int 

class Contact(BaseModel):
	name:str
	email:EmailStr
	phone:str
class Attraction(BaseModel):	
	attraction_id:int
	attraction_name:str
	address:str
	image:str	
class Trip(BaseModel):
	attraction:Attraction
	date:str
	time:str
class Orderdetail(BaseModel):
	price:int
	trip:Trip
	contact:Contact
class Order(BaseModel):
	prime:str
	order:Orderdetail
@app.post("/api/user")
def register(user:Register):
	try: 
		with connect_mysql() as con:
			with con.cursor(dictionary=True, buffered=True) as cursor:		
				cursor.execute("SELECT id FROM member WHERE email=%s",(user.email,))
				db_user=cursor.fetchone()
				if db_user:
					raise HTTPException(status_code=400,detail={"error":True,"message":"註冊失敗，Email已被註冊"})
				hashed_password=password_tool.hash(user.password)		
				cursor.execute("INSERT INTO member(name,email,password)values(%s,%s,%s)",(user.name,user.email,hashed_password))
				con.commit()
				return{"ok":True}
	except mysql.connector.Error:
		raise HTTPException(status_code=500,detail={"error":True,"message":"伺服器內部錯誤"})
	
@app.put("/api/user/auth")
def signin(user:Signin):
	try:
		with connect_mysql() as con:
			with con.cursor(dictionary=True, buffered=True) as cursor:			
				cursor.execute("SELECT id, name, email, password FROM member WHERE email=%s",(user.email,))
				db_user= cursor.fetchone()
				if not db_user or not password_tool.verify(user.password,db_user["password"]):
					raise HTTPException(status_code=400,detail={"error":True,"message":"登入失敗，帳號或密碼錯誤"})
				token=create_token({
					"id":db_user["id"],
					"name":db_user["name"],
					"email":db_user["email"],		
				})
				return{"token":token}
	except mysql.connector.Error:
		raise HTTPException(status_code=500,detail={"error":True,"message":"伺服器內部錯誤"})
	
@app.get("/api/user/auth")
def current_user(data:dict=Depends(verify_token)):
	try:
		with connect_mysql() as con:
			with con.cursor(dictionary=True, buffered=True) as cursor:
				cursor.execute("SELECT id, name, email FROM member where email=%s",(data["email"],))
				db_user=cursor.fetchone()
				if not db_user:
					return {"data":None}
				return {"data":db_user}
	except mysql.connector.Error:
		raise HTTPException(status_code=500,detail={"error":True,"message":"伺服器內部錯誤"})
	
@app.get("/api/booking")
def get_booking(user:dict=Depends(verify_token)):		
	try:
		with connect_mysql() as con:
			with con.cursor(dictionary=True, buffered=True) as cursor:		
				cursor.execute("SELECT a.id, a.name, a.address, i.url, b.date, b.time, b.price From attractions a INNER JOIN booking b ON a.id = b.attraction_id LEFT JOIN imgs i ON  a.id = i.attraction_id WHERE b.member_id=%s",(user["id"],))
				data=cursor.fetchone()
				if not data:
					return {"data":None}
				return{
					"data":{
						"attraction":{
							"id":data["id"],
							"name":data["name"],
							"address":data["address"],
							"image":data["url"]
						},
						"date":data["date"],
						"time":data["time"],
						"price":data["price"]
					}
				}
	except mysql.connector.Error:
		raise HTTPException(status_code=500,detail={"error":True,"message":"伺服器內部錯誤"})
	
@app.post("/api/booking")
def create_booking(create_data:CreateBooking,user:dict=Depends(verify_token)):
	if create_data.date<date.today():
		raise HTTPException(status_code=400,detail={"error":True,"message":"日期錯誤"})
	try:
		with connect_mysql() as con:
			with con.cursor(dictionary=True, buffered=True) as cursor:		
				cursor.execute("SELECT * FROM booking WHERE member_id= %s",(user["id"],))
				data=cursor.fetchone()
				if data:
					cursor.execute("DELETE FROM booking WHERE member_id= %s",(user["id"],))
				cursor.execute("INSERT INTO booking(member_id, attraction_id, date, time, price)values(%s,%s,%s,%s,%s)",((user["id"]), create_data.attractionId, create_data.date, create_data.time,create_data.price))
				con.commit()
				return {"ok": True}
	except Exception as e:
		raise HTTPException(status_code=500,detail={"error":True,"message":str(e)})
	
@app.delete("/api/booking")
def delete_booking(user:dict=Depends(verify_token)):
	try:
		with connect_mysql() as con:
			with con.cursor(dictionary=True, buffered=True) as cursor:
				cursor.execute("DELETE FROM booking WHERE member_id=%s",(user["id"],))
				con.commit()
				return {"ok": True}
	except:
		raise HTTPException(status_code=500,detail={"error":True,"message":"伺服器內部錯誤"})
	
#--------------------------------------------
@app.get("/api/attractions")
def attractions(page: int, keyword:str=None):
	try:
		with connect_mysql() as con:
			with con.cursor(dictionary=True, buffered=True) as cursor:		
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
	
@app.get("/api/attraction/{attractionId}")
def attraction(attractionId:int):
	try:
		with connect_mysql() as con:
			with con.cursor(dictionary=True, buffered=True) as cursor:
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

@app.get("/api/mrts")
def mrt():
	try:
		with connect_mysql() as con:
			with con.cursor(dictionary=True, buffered=True) as cursor:				
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
	
#---------------------------------------	
@app.post("/api/orders")
def orders(orderData:Order,user:dict=Depends(verify_token)):
	if not user:
		raise HTTPException(status_code=403,detail={"error":True,"message":"未登入"})
	order_number=datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")+"_"+str(user["id"])
	try:
		with connect_mysql() as con:
			with con.cursor(dictionary=True, buffered=True) as cursor:				
				cursor.execute("""
				INSERT INTO orders(order_number, member_id, attraction_id, date, time, price, contact_name, contact_email, contact_phone)
				VALUES( %s, %s, %s, %s, %s, %s, %s, %s, %s)""",(
				order_number,
				user["id"], 
				orderData.order.trip.attraction.attraction_id,
				orderData.order.trip.date,
				orderData.order.trip.time,
				orderData.order.price,
				orderData.order.contact.name,
				orderData.order.contact.email,
				orderData.order.contact.phone,
				))
				con.commit()
				response=requests.post("https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime",
				headers={
					"Content-Type":"application/json",
					"x-api-key":os.getenv("partner_key")
				},
				json={
					"prime": orderData.prime,
					"partner_key": os.getenv("partner_key"),
					"merchant_id":os.getenv("merchant_id"),
					"details":"Taipei_day_trip",
					"amount": orderData.order.price,
					"cardholder": {
						"phone_number": orderData.order.contact.phone,
						"name": orderData.order.contact.name,
						"email": orderData.order.contact.email,						
					},	
				}
				)
				result=response.json()
				status=result["status"]
				msg=result["msg"]
				if status== 0:
					cursor.execute("UPDATE orders SET status=%s WHERE order_number=%s",("PAID", order_number))
					cursor.execute("DELETE  FROM booking WHERE member_id=%s",(user["id"],))
					con.commit()
				return{
					"data": {
						"number": order_number,
						"payment": {
						"status": status,
						"message": msg
						}
					}}
	except Exception as e :
		con.rollback()
		raise HTTPException(status_code=500, detail={"error":True,"message":str(e)})
		
@app.get("/api/order/{orderNumber}")
def get_order(orderNumber:str,user:dict=Depends(verify_token)):
	if not user:
		raise HTTPException(status_code=403, detail={"error":True,"message":"未登入"})
	try:
		with connect_mysql() as con:
			with con.cursor(dictionary=True, buffered=True) as cursor:		
				cursor.execute("SELECT orders.* ,attractions.name, attractions.address, imgs.url FROM orders JOIN attractions ON orders.attraction_id = attractions.id JOIN imgs ON orders.attraction_id = imgs.attraction_id   WHERE order_number=%s",(orderNumber,))
				order_data=cursor.fetchone()	
				status=0	
				if order_data["status"]=="unpaid":
					status=1
					
				return	{"data": {
					"number": order_data["order_number"],
					"price": order_data["price"],
					"trip": {
					"attraction": {
						"id": order_data["attraction_id"],
						"name": order_data["name"],
						"address": order_data["address"],
						"image": order_data["url"]
					},
					"date": order_data["date"],
					"time": order_data["time"]
					},
					"contact": {
					"name": order_data["contact_name"],
					"email": order_data["contact_email"],
					"phone": order_data["contact_phone"]
					},
					"status": status
					}}			
	except Exception as e:
		raise HTTPException(status_code=500,detail={"error":True,"message":str(e)})
	

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