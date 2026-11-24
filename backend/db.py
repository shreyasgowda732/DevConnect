
import mysql.connector
import os
from dotenv import load_dotenv

# Find the main DevConnect project folder
BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

# Load the root .env file
ENV_PATH = os.path.join(BASE_DIR, ".env")
load_dotenv(ENV_PATH, override=True)


def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host="127.0.0.1",
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )

        print("MySQL Database Connected Successfully!")
        return connection

    except mysql.connector.Error as error:
        print("Database Connection Error:", error)
        raise
