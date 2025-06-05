import Swal from "sweetalert2";

export const MySwal = Swal.mixin({
  heightAuto: false,
});

export const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-left',
  iconColor: 'white',
  showConfirmButton: false,
  timer: 5000,
  timerProgressBar: true,
});

export const ToastSuccess = Toast.mixin({
	icon: 'success',
	background: '#a5dc86',
});

export const ToastWarning = Toast.mixin({
	icon: 'warning',
	background: '#f0ec0d',
});

export const ToastError = Toast.mixin({
	icon: 'error',
	background: '#f27474',
  color: 'white',
});

export const ToastInfo = Toast.mixin({
	icon: 'info',
	background: '#0dcaf0',
});

export const ToastQuestion = Toast.mixin({
	icon: 'question',
	background: '#655cc9',
  color: 'white',
});