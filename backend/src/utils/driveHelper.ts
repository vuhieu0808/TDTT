export const generateUniqueFileName = (originalName: string): string => {
  const ext = originalName.substring(originalName.lastIndexOf("."));
  const name = originalName.substring(0, originalName.lastIndexOf("."));
  const timestamp = Date.now();
  return `${name}_${timestamp}${ext}`;
}