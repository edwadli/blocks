from env import pymongo_env

def _GetCollection(namespace, database):
    """Returns the specified collection or the default."""
    if database is None:
        database = pymongo_env.PUBLIC_DB
    if namespace is None:
        collection = database['test_secrets']
    else:
        collection = database[namespace]
    return collection

def ReadSecret(name, namespace=None, database=None):
    """Returns the secret value, or None."""
    collection = _GetCollection(namespace, database)
    result = collection.find_one({'_id': name})
    if result is None:
        return None
    return result.get('value', None)

def WriteSecret(name, value, namespace=None, database=None):
    """Writes the secret value."""
    collection = _GetCollection(namespace, database)
    collection.replace_one({'_id': name},
                           {'_id': name, 'value': value},
                           upsert=True)
