
from flask import Flask, jsonify, request
from flask_cors import CORS
from auth import auth
from db import get_db_connection

app = Flask(__name__)
app.register_blueprint(auth)
CORS(app)


# --------------------------------
# HOME API
# --------------------------------

@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to DevConnect API",
        "status": "Running"
    })


# --------------------------------
# TEST API
# --------------------------------

@app.route("/api/hello", methods=["GET"])
def hello():

    return jsonify({
        "message": "Hello from DevConnect Backend!"
    })


# --------------------------------
# GET ALL RESOURCES
# --------------------------------

@app.route("/api/resources", methods=["GET"])
def get_resources():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM resources ORDER BY id DESC")

        resources = cursor.fetchall()

        return jsonify(resources), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# --------------------------------
# ADD NEW RESOURCE
# --------------------------------

@app.route("/api/resources", methods=["POST"])
def add_resource():

    data = request.get_json(silent=True) or {}

    title = data.get("title", "").strip()
    category = data.get("category", "").strip()
    description = data.get("description", "").strip()

    if not title or not category:

        return jsonify({
            "error": "Title and category are required"
        }), 400

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
            INSERT INTO resources
            (title, category, description)
            VALUES (%s, %s, %s)
        """

        cursor.execute(
            query,
            (title, category, description)
        )

        connection.commit()

        return jsonify({
            "message": "Resource added successfully",
            "id": cursor.lastrowid
        }), 201

    except Exception as e:

        if connection and connection.is_connected():
            connection.rollback()

        return jsonify({
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# --------------------------------
# UPDATE RESOURCE
# --------------------------------

@app.route("/api/resources/<int:resource_id>", methods=["PUT"])
def update_resource(resource_id):

    data = request.get_json(silent=True) or {}

    title = data.get("title", "").strip()
    category = data.get("category", "").strip()
    description = data.get("description", "").strip()

    if not title or not category:

        return jsonify({
            "error": "Title and category are required"
        }), 400

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
            UPDATE resources
            SET title = %s,
                category = %s,
                description = %s
            WHERE id = %s
        """

        cursor.execute(
            query,
            (title, category, description, resource_id)
        )

        connection.commit()

        if cursor.rowcount == 0:

            return jsonify({
                "error": "Resource not found or no changes made"
            }), 404

        return jsonify({
            "message": "Resource updated successfully"
        }), 200

    except Exception as e:

        if connection and connection.is_connected():
            connection.rollback()

        return jsonify({
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# --------------------------------
# DELETE RESOURCE
# --------------------------------

@app.route("/api/resources/<int:resource_id>", methods=["DELETE"])
def delete_resource(resource_id):

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "DELETE FROM resources WHERE id = %s",
            (resource_id,)
        )

        connection.commit()

        if cursor.rowcount == 0:

            return jsonify({
                "error": "Resource not found"
            }), 404

        return jsonify({
            "message": "Resource deleted successfully"
        }), 200

    except Exception as e:

        if connection and connection.is_connected():
            connection.rollback()

        return jsonify({
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# --------------------------------
# RUN SERVER
# --------------------------------

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
