// Generates or retrieves a persistent anonymous participant ID
export function getParticipantId() {
  let id = localStorage.getItem('velemeny_participant_id');
  if (!id) {
    id = 'p_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem('velemeny_participant_id', id);
  }
  return id;
}
