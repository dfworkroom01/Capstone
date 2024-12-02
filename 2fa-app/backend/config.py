import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', '')
    MYSQL_HOST = 'localhost'
    MYSQL_USER = 'root'  
    MYSQL_PASSWORD = ''  
    MYSQL_DB = ''
    JWT_TOKEN_LOCATION = ['headers']
