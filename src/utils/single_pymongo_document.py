from env import pymongo_env

class SinglePymongoDocument(object):
  """A database accessor for a single document."""
  def __init__(self, doc_id, document=None, collection=None):
    """Initializes the SinglePymongoDocument.

    The document with id 'doc_id' is used from the given 'collection'.

    Args:
        doc_id: The id of the document to use.
        document: The document to initialize with if one does not exist.
        collection: The database collection to use.
    """
    # Use the default public database if no collection is specified.
    if collection is None:
      collection = pymongo_env.PUBLIC_DB['test_collection']
    self._collection = collection

    # Check if there already exists a document with 'doc_id'.
    self._doc = {'_id': doc_id}
    result = collection.find_one(self._doc)
    if result is None:
      # Create the document.
      if document is None:
        document = {}
      document.update(self._doc)
      collection.insert_one(document)

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

