from qupython import Qubit, quantum

@quantum
def runtime():
	q_my_qubit = Qubit()
	q_my_qubit.h()
	for i in range(3):
		q_my_qubit.rx(60.0)
		q_my_qubit.u(30.0, 45.5, 60.0)
		
	q_other_qubit = Qubit()
	q_other_qubit.h()
	result_q_my_qubit = q_my_qubit.measure()
	
	q_other_qubit.rx(30.0)
	result_q_other_qubit = q_other_qubit.measure()
	
	return ['result_q_my_qubit', 'result_q_other_qubit']
print(runtime())