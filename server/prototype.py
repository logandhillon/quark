from qupython import Qubit, quantum

@quantum
def random_bit():
    qubit = Qubit()
    qubit.h()
    return qubit.measure()

print(random_bit())