import bson

from env import pymongo_env

class SinglePymongoDocument(object):
  """A database accessor for a single document."""
  def __init__(self, doc_id=None, id_field=None, document=None, collection=None):
    """Initializes the SinglePymongoDocument.

    The document with id 'doc_id' is used from the given 'collection'.

    Args:
        doc_id: The id of the document to use.
        id_field: The name of the field to copy the id to if a new doc is created.
        document: The document to initialize with if one does not exist.
        collection: The database collection to use.
    """
    # Use the default public database if no collection is specified.
    if collection is None:
      collection = pymongo_env.PUBLIC_DB['test_collection']
    self._collection = collection
    
    if document is None:
      document = {}
      
    doc_id = bson.objectid.ObjectId(str(doc_id))

    if doc_id is None:
      # Insert a new document.
      result_id = collection.insert_one(document).inserted_id
      self._doc = {'_id': result_id}
      collection.update_one(self._doc, {'$set': {id_field: str(result_id)}})
    else:
      # Check if there already exists a document with 'doc_id'.
      self._doc = {'_id': doc_id}
      result = collection.find_one(self._doc)
      if result is None:
        # Create the document with the given id.
        document_with_id = {
          '_id': doc_id
        }
        document_with_id.update(document)
        if id_field is not None:
          document_with_id[id_field] = doc_id
        collection.insert_one(document_with_id)
      
  def UpdateDocument(self, update):
    """Updates the document with 'update' pymongo dict."""
    return self._collection.update_one(self._doc, update)

  def UpdateFields(self, update):
    """Updates the document with the field/valules in 'update'."""
    return self._collection.update_one(self._doc, {'$set': update})

  def GetDocument(self):
    """Returns the document."""
    return self._collection.find_one(self._doc)

  def ReplaceDocument(self, replacement):
    """Replaces the document with 'document'."""
    return self._collection.replace_one(self._doc, replacement)

  def DeleteDocument(self):
    """Deletes the document."""
    return self._collection.find_one_and_delete(self._doc)
