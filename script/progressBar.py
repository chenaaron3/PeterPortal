import progressbar

class ProgressBar():
    def __init__(self, length):
        self.bar = progressbar.ProgressBar(maxval=length, widgets=[progressbar.Bar('=', '[', ']'), ' ', progressbar.Percentage()])
        self.max = length
        self.value = 0
        self.bar.start()
    
    def inc(self):
        self.value += 1
        self.bar.update(self.value)
        if self.value == self.max:
            self.bar.finish()