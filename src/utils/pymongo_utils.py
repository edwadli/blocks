"""Utilities for writing documents to MongoDb.
"""

from src.utils import proto_utils

def GetOne(filter, collection):
  """Gets a single document, if present.
  
  Args:
    filter: A dict with filter parameters for MongoDB
    collection: A MongoDB collection.
    
  Returns:
    The document (dict), or None
  
  Raises:
    LookupError: More than one document matched the filter.
  """
  count = collection.count_documents(filter, limit=2)
  if count > 1:
    raise LookupError("More than one document found")
  return collection.find_one(filter)
  

def DeleteOne(filter, collection):
  """Deletes a single document, if present.
  
  Args:
    filter: A dict with filter parameters for MongoDB
    collection: A MongoDB collection.
    
  Returns:
    Whether a document was deleted.
  
  Raises:
    LookupError: More than one document matched the filter.
  """
  count = collection.count_documents(filter, limit=2)
  if count > 1:
    raise LookupError("More than one document found")
  elif count < 1:
    return False
  collection.find_one_and_delete(filter)
  return True


def UpdateOne(filter, update, collection):
  """Updates a single document.
  
  Args:
    filter: A dict with filter parameters for MongoDB
    update: The update key-value pairs.
    collection: A MongoDB collection.
    
  Returns:
    Whether a document was updated.

  Raises:
    LookupError: More than one document matched the filter.
  """
  count = collection.count_documents(filter, limit=2)
  if count > 1:
    raise LookupError("More than one document found")
  collection.update_one(filter, {"$set": update})
  return count == 1


def UpdateMessage(filter, message, collection):
  """Updates the document with the given message.
  
  Args:
    filter: A dict with filter parameters for MongoDB
    message: The new proto values.
    collection: A MongoDB collection.
    
  Raises:
    LookupError: Not exactly one document matched the filter.
  """
  document = {}
  proto_utils.MergeProtoToDict(message, document)
  has_updated = UpdateOne(filter, document, collection)
  if not has_updated:
    raise LookupError("No documents found")

    
def AddMessage(message, collection, id_field=None):
  """Inserts the proto as a document into the collection.
  
  If 'id_field' is specified, then that field of 'message'
  will be filled with the str() of the ObjectId of the inserted document.
  
  Args:
    message: The proto to convert to insert.
    collection: A MongoDB collection.
    id_field: The name of the field to copy the inserted id to.
    
  Raises:
    KeyError: The specified field is not a field of the given proto.
  """
  if id_field is not None and not hasattr(message, id_field):
    raise KeyError("Name [%s] is not a field of the given proto" % id_field)
  document = {}
  proto_utils.MergeProtoToDict(message, document)
  inserted_id = collection.insert_one(document).inserted_id
  if id_field is not None:
    collection.update_one({"_id": inserted_id}, {"$set": {id_field: str(inserted_id)}})

  
def GetMessage(filter, collection, message):
  """Merges 'message' with the message from the given 'collection'.
  
  Args:
    filter: A dict with filter parameters for MongoDB
    collection: A MongoDB collection.
    message: The proto to set.
    
  Returns:
    Whether a message was successfully retrieved from the collection.
    
  Raises:
    LookupError: More than one document matched the filter.
  """
  result = GetOne(filter, collection)
  if result is None:
    return False
  del result['_id']
  proto_utils.MergeDictToProto(result, message)
  return True
  