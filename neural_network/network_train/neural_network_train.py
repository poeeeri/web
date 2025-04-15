import time
import math
from network import Network
import h5py
import matplotlib.pyplot as plt
import numpy as np


class DataNetwork:
    def __init__(self, l, size):
        self.l = l
        self.size = size


def main():
    NW = Network()
    NW.load_data()

    NWConfig = DataNetwork(3, [784, 128, 10])
    NW.init(NWConfig)
    repeat = True

    while repeat:
        print("обучить нейронку? (1/0): ")
        study = input()
        if study == "1":
            examples = len(NW.train_x)
            ra = 0
            epoch = 1
            start_time = time.time()

            while ra / examples * 100 < 100:
                ra = 0
                for i in range(examples):
                    NW.set_input(NW.train_x[i]) # [0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                    predict_output = NW.forward_feed()
                    predicted_digit = NW.search_max_index(predict_output)
                    if predicted_digit != NW.train_y[i]:
                        expected_output = [0.0 for _ in range(NW.size[-1])]
                        expected_output[NW.train_y[i]] = 1.0
                        NW.back_propagation(expected_output)
                        NW.weight_updater(0.1) # 0.15 * math.exp(-epoch / 20.0)
                    else:
                        ra += 1

                print(f"ra: {ra / examples * 100:.2f}%", end='\t')
                print(f"epoch: {epoch}")
                epoch += 1
                if epoch == 10:
                    break
            print(f"время обучения: {(time.time() - start_time) / 60:.2f} min")
            NW.save_weights()
        else:
            NW.read_weights()

        if input("тест нейронки? (1/0): ") == "1":
            correct = 0
            for i in range(len(NW.test_x)):
                NW.set_input(NW.test_x[i])
                predict = NW.forward_feed()
                if NW.search_max_index(predict) == NW.test_y[i]:
                    correct += 1
            print(f"тест резы: {correct / len(NW.test_x) * 100:.2f}%")

        repeat = input("повторить? (1/0): ") == "1"


if __name__ == "__main__":
    main()
