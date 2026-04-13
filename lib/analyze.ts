export function estimateTalkRatio(transcript: string): number {
  // Try to detect speaker prefixes
  const guillermoPrefixes = /^(G:|Guillermo:|Interviewer:|Host:)\s*/gim;
  const clientPrefixes = /^(Client:|C:|Customer:|Guest:)\s*/gim;

  const guillermoMatches = transcript.match(guillermoPrefixes);
  const clientMatches = transcript.match(clientPrefixes);

  if (guillermoMatches && clientMatches) {
    // Count words for each speaker
    const lines = transcript.split('\n');
    let guillermoWords = 0;
    let clientWords = 0;
    let currentSpeaker: 'g' | 'c' | null = null;

    for (const line of lines) {
      if (/^(G:|Guillermo:|Interviewer:|Host:)/i.test(line)) {
        currentSpeaker = 'g';
        const text = line.replace(/^(G:|Guillermo:|Interviewer:|Host:)\s*/i, '');
        guillermoWords += text.split(/\s+/).filter(Boolean).length;
      } else if (/^(Client:|C:|Customer:|Guest:)/i.test(line)) {
        currentSpeaker = 'c';
        const text = line.replace(/^(Client:|C:|Customer:|Guest:)\s*/i, '');
        clientWords += text.split(/\s+/).filter(Boolean).length;
      } else if (line.trim() && currentSpeaker === 'g') {
        guillermoWords += line.split(/\s+/).filter(Boolean).length;
      } else if (line.trim() && currentSpeaker === 'c') {
        clientWords += line.split(/\s+/).filter(Boolean).length;
      }
    }

    const total = guillermoWords + clientWords;
    if (total > 0) return Math.round((guillermoWords / total) * 100);
  }

  // Fallback: estimate from question marks
  const sentences = transcript.split(/[.!?]+/).filter(Boolean);
  const questions = transcript.split('?').length - 1;
  const total = sentences.length;

  if (total > 0) {
    // Assume Guillermo asks most questions (sales context)
    const guillermoEstimate = Math.min(70, Math.max(30, Math.round((questions / total) * 100 * 1.5)));
    return guillermoEstimate;
  }

  return 50; // default
}
