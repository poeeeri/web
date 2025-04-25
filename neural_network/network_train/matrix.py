import random


class Matrix:
    def __init__(self, rows=0, cols=0):
        self.matrix = []
        self.rows = rows
        self.cols = cols
        self.init(rows, cols)

    def init(self, rows, cols):
        self.rows = rows
        self.cols = cols
        self.matrix = [[0.0 for i in range(cols)] for j in range(rows)]

