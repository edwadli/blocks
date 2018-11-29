from src.utils import single_pymongo_document

class SimplePymongoCounter(single_pymongo_document.SinglePymongoDocument):
    def __init__(self):
        document = {'count': 0}
        super(SimplePymongoCounter, self).__init__(
            'test_counter_collection', document=document)
            
    def GetCount(self):
        """Returns the current count."""
        return self.GetDocument()['count']
        
    def Increment(self):
        """Increments the current count and returns the count."""
        self.UpdateDocument({'$inc': {'count': 1}})
        return self.GetCount()
    
    def Reset(self, start=0):
        """Resets the count to 'start' and returns the value itself."""
        self.ReplaceDocument({'count': start})
        return self.GetCount()
