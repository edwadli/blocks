from pymongo import MongoClient

PUBLIC_DB = MongoClient(
    host='localhost',
    port=27017,
    username='public',
    password='public')['public_dp']
