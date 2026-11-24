
import mysql.connector
from dotenv import load_dotenv
import os
from getpass import getpass

# Load project environment variables
load_dotenv(".env", override=True)

print("Testing MySQL connection...")

# First test: credentials from .env
try:
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

    print("SUCCESS: .env connection working!")
    connection.close()

except mysql.connector.Error as error:
    print("Environment connection failed:", error)

    # Second test: enter password privately
    print("\nTesting password directly...")
    password = getpass("Enter your working MySQL root password: ")

    try:
        connection = mysql.connector.connect(
            host="127.0.0.1",
            user="root",
            password=password,
            database="devconnect"
        )

        print("SUCCESS: Direct Python connection working!")
        connection.close()

    except mysql.connector.Error as error:
        print("Direct connection failed:", error)
