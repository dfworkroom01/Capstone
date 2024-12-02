import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', '888WILPX55DF')
    MYSQL_HOST = 'localhost'
    MYSQL_USER = 'root'  
    MYSQL_PASSWORD = 'SQLdewf16!'  
    MYSQL_DB = '2fa_app'
    JWT_TOKEN_LOCATION = ['headers']
