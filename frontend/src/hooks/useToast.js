import { useToastStore } from '../stores/useToastStore';

/**
 * Custom React hook to trigger toast notifications.
 * @returns {{showToast: Function}}
 */
export function useToast() {
  const showToast = useToastStore((state) => state.showToast);
  return { showToast };
}
export default useToast;
