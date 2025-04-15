import numpy as np


class ActivateFuncRelu:
    @staticmethod
    def relu(x):
        return np.maximum(0.1 * x, x)

    @staticmethod
    def relu_derivative(x):
        return np.where(x > 0, 1, 0.01)