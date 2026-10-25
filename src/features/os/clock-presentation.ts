/** Display only: keep the canonical HH:mm model and ISO dateTime attributes intact. */
export function displayWibTime(time: string) {
  return time.replace(/^(\d{2}|--):(\d{2}|--)$/, "$1.$2");
}
