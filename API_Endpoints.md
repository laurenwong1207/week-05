# Endpoints Overview
# 1. List All Data
    GET /data
    Description: Retrieves all data from the "visualizeC" collection in the MongoDB database.
    URL: /data
    Method: GET
    Query Parameters: None
    Request Body: None
    Success Response:
    Code: 200 OK
    Content Example:
        {"_id": "5f2b3c2d9d1a2e456d83f790", "Type": "Inception", "data": "Description of Inception"},
        {"_id": "5f2b3c2d9d1a2e456d83f791", "Type": "Interstellar", "data": "Description of Interstellar"}
2. Add Data
    POST /data
    Description: Adds a new document to the "visualizeC" collection.
    URL: /data
    Method: POST
    Query Parameters: None
    Request Body:
    Content Example:
        "Type": "The Matrix",
        "data": "Description of The Matrix"
    Success Response:
    Code: 201 Created
    Content Example:
    {"message": "Data added successfully"}
3. Update Data
    PUT /data/:id
    Description: Updates the details of a specific document in the "visualizeC" collection by its MongoDB _id.
    URL: /data/:id
    Method: PUT
    URL Parameters:
    id: MongoDB ObjectId, required, the _id of the document to update.
    Request Body:
    Content Example:
        "Type": "The Matrix Reloaded",
        "data": "Updated description of The Matrix Reloaded"
    Success Response:
    Code: 200 OK
    Content Example:
    {"message": "Data updated successfully"}
4. Delete Data
    DELETE /data/:id
    Description: Removes a document from the "visualizeC" collection by its MongoDB _id.
    URL: /data/:id
    Method: DELETE
    URL Parameters:
    id: MongoDB ObjectId, required, the _id of the document to delete.
    Request Body: None
    Success Response:
    Code: 200 OK
    Content Example:
    {"message": "Data deleted successfully"}