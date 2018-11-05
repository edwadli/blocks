from env import pymongo_env

class SimplePymongoCounter(object):
    def __init__(self):
        self._counter_collection = pymongo_env.PUBLIC_DB['test_collection']
        counter = self._counter_collection.find_one()
        if counter is None:
            counter_id = self._counter_collection.insert_one(
                {'count': 0}).inserted_id
        else:
            counter_id = counter['_id']
        self._counter_id = counter_id
        
    def GetCount(self):
        """Returns the current count."""
        counter = self._counter_collection.find_one({'_id': self._counter_id})
        return counter['count']
        
    def _UpdateCount(self, new_count):
        self._counter_collection.update_one(
            {'_id': self._counter_id}, {"$set": {'count': new_count}})
        
    def Increment(self):
        """Increments the count and returns the new count."""
        new_count = self.GetCount() + 1
        self._UpdateCount(new_count)
        return new_count

    def Reset(self, start=0):
        """Resets the count to 'start' and returns the value itself."""
        self._UpdateCount(start)
        return start
