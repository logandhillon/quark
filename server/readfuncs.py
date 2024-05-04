import inspect

from qupython import Qubit, quantum

def get_class_methods(cls):
    # This will filter and return only those members that are callable (i.e., methods of the class)
    return [member for member in inspect.getmembers(cls, predicate=inspect.isfunction)]

@quantum
def read_in_out(func):
    print("temp")

@quantum
# Returns all the methods of specified class in list
def read_funcs(cls):
    methods = get_class_methods(cls)
    all_methods = []
    for method_name, method in methods:
        all_methods.append(method_name)
    return all_methods

if __name__ == '__main__':
    cls = Qubit()
    methods = read_funcs(cls)
    print(methods)