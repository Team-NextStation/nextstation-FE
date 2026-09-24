import { toast, type ToastPosition } from "react-toastify";

interface ToastProps {
  message: string;
  position?: ToastPosition;
}

export const showToast = ({
  message,
  position = "top-center",
}: ToastProps) => {
  toast(message, {
    position,
    autoClose: 1200,
    hideProgressBar: true,
    closeOnClick: true,
  });
};
