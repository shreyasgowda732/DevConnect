
import os
from dotenv import load_dotenv
from getpass import getpass
import hmac

# Find the main DevConnect folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ENV_PATH = os.path.join(BASE_DIR, ".env")

print("Project folder:", BASE_DIR)
print("Environment file exists:", os.path.isfile(ENV_PATH))

# Load environment file
load_dotenv(ENV_PATH, override=True)

password = os.getenv("DB_PASSWORD")

print("Password loaded:", bool(password))

if not password:
    print("ERROR: DB_PASSWORD is missing.")
    raise SystemExit

manual_password = getpass("Enter working MySQL password: ")

if hmac.compare_digest(password, manual_password):
    print("SUCCESS: Password matches!")
else:
    print("ERROR: Password does not match!")
