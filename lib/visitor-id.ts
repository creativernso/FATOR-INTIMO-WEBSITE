export function getOrCreateVisitorId(): string {
  const key = 'fi_visitor_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `visitor_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, id);
  }
  return id;
}
