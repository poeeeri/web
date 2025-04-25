import random
import numpy as np
from matrix import Matrix
import activate_function
import h5py
import matplotlib.pyplot as plt
import math

class DataNetwork:
    def __init__(self, l, size):
        self.l = l
        self.size = size


class Network:
    def __init__(self):
        self.l = 0
        self.size = []
        self.bios = []
        self.act_func = activate_function.ActivateFuncRelu()
        self.weight = []
        self.neurons_val = []
        self.neurons_error = []
        self.neurons_bios_val = []
        self.train_x = None
        self.train_y = None
        self.test_y = None
        self.test_x = None

    def load_data(self, train_path="train.hdf5", test_path="test.hdf5"):
        with h5py.File(train_path, 'r') as f:
            self.train_x = np.array(f['image'][...], dtype=np.float32)
            self.train_y = np.array(f['label'][...], dtype=np.int32)

        with h5py.File(test_path, 'r') as f:
            self.test_x = np.array(f['image'][...], dtype=np.float32)
            self.test_y = np.array(f['label'][...], dtype=np.int32)

        self.train_x = self.train_x.reshape(-1, 784)
        self.test_x = self.test_x.reshape(-1, 784)
        self.train_x = self.train_x / 255.0
        self.test_x = self.test_x / 255.0


    def init(self, data: DataNetwork):
        self.l = data.l
        self.size = data.size
        self.weight = []

        for i in range(1, self.l):
            rows = self.size[i]
            cols = self.size[i - 1]

            # he-инициализация
            scale = math.sqrt(2.0 / self.size[i - 1])

            # рандом значения весов с he-инициализацией
            weight_matrix = Matrix(rows, cols)
            for j in range(rows):
                for k in range(cols):
                    weight_matrix.matrix[j][k] = random.gauss(mu=0, sigma=scale)
            self.weight.append(weight_matrix)

        self.bios = [[random.random() for k in range(self.size[i])] for i in range(1, self.l)]

        self.neurons_val = [[0.0 for _ in range(n)] for n in self.size]
        self.neurons_error = [[0.0 for _ in range(n)] for n in self.size]
        self.neurons_bios_val = [0.0 for _ in range(self.l)]


    # во входной слой записываем значения нейронов
    def set_input(self, value):
        self.neurons_val[0] = value.tolist()

    # прямое распространение
    def forward_feed(self):
        for i in range(1, self.l):
            new_vals = []
            for j in range(self.size[i]):
                sum_val = sum(self.weight[i-1].matrix[j][k] * self.neurons_val[i - 1][k] for k in range(self.size[i - 1]))
                sum_val += self.bios[i - 1][j]
                new_vals.append(self.act_func.relu(sum_val))
            self.neurons_val[i] = new_vals
        return self.neurons_val[-1]

    def search_max_index(self, value):
        return value.index(max(value))

    # братное распространение
    def back_propagation(self, expected):
        if not isinstance(expected, list):
            expected = [expected]

        for i in range(self.size[-1]):
            val = self.neurons_val[-1][i]
            self.neurons_error[-1][i] = (val - expected[i]) * self.act_func.relu_derivative(val)

        for i in reversed(range(1, self.l - 1)):
            for j in range(self.size[i]):
                err = 0.0
                for k in range(self.size[i + 1]):
                    err += self.weight[i].matrix[k][j] * self.neurons_error[i + 1][k]

                self.neurons_error[i][j] = err * self.act_func.relu_derivative(self.neurons_val[i][j])

    def weight_updater(self, learning_rate):
        max_grad = 1.0
        for i in range(self.l - 1):
            for j in range(self.size[i + 1]):
                # обрезаем градиент
                self.neurons_error[i + 1][j] = np.clip(
                    self.neurons_error[i + 1][j],
                    -max_grad,
                    max_grad
                )

                for k in range(self.size[i]):
                    delta = learning_rate * self.neurons_error[i + 1][j] * self.neurons_val[i][k]
                    self.weight[i].matrix[j][k] -= delta

                self.bios[i][j] -= learning_rate * self.neurons_error[i + 1][j]

    # сохраняем значение весов в файлик
    def save_weights(self, filename="weights.txt"):
        with open(filename, "w") as fn:
            for mtrx in self.weight:
                for row in mtrx.matrix:
                    fn.write(" ".join(map(str, row)) + "\n")

            fn.write("BIAS\n")
            for b in self.bios:
                fn.write(" ".join(map(str, b)) + "\n")

    # читаем значения весов из файлика
    def read_weights(self, filename="weights.txt"):
        with open(filename, "r") as fn:
            lines = fn.readlines()

        idx = 0
        for mtx in self.weight:
            for i in range(mtx.rows):
                mtx.matrix[i] = list(map(float, lines[idx].strip().split()))
                idx += 1

        if lines[idx].strip() == "BIAS":
            idx += 1
            for i in range(len(self.bios)):
                self.bios[i] = list(map(float, lines[idx].strip().split()))
                idx += 1