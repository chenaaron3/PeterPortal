import progressbar

class ProgressBar():
    def __init__(self, length, debug=False):
        self.bar = progressbar.ProgressBar(maxval=length, widgets=[progressbar.Bar('=', '[', ']'), ' ', progressbar.Percentage()])
        self.max = length
        self.debug = debug
        self.value = 0
        self.bar.start()
        if debug:
            print()
    
    def inc(self):
        self.value += 1
        self.bar.update(self.value)
        if self.debug:
            print()
        if self.value == self.max:
            self.bar.finish()