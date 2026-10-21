import { describe, expect, it } from 'vitest';
import { joinBrokenSegments } from '../transcriptSegments';
import { TranscriptSegment } from '@/types/transcript';

function segment(
  partial: Pick<TranscriptSegment, 'id' | 'start' | 'end' | 'text'> &
    Partial<Pick<TranscriptSegment, 'speakerId' | 'speakerName'>>,
): TranscriptSegment {
  return {
    speakerId: 'spk-1',
    speakerName: 'Speaker 1',
    words: [],
    ...partial,
  };
}

describe('joinBrokenSegments', () => {
  it('joins a sentence that was split after a comma', () => {
    const joined = joinBrokenSegments([
      segment({
        id: 'seg-0',
        start: 0,
        end: 5,
        text: 'Eu preciso de um ajuste na produção.',
      }),
      segment({
        id: 'seg-1',
        start: 6,
        end: 15,
        text: 'O dashboard onde tem as métricas quebrou e eu queria que o Mateus corrigisse isso. É um problema provavelmente no front-end,',
      }),
      segment({
        id: 'seg-2',
        start: 16,
        end: 24,
        text: 'e no back-end a gente tem um erro, e esse erro precisa ser corrigido pelo Danilo.',
      }),
    ]);

    expect(joined).toHaveLength(2);
    expect(joined[0].text).toBe('Eu preciso de um ajuste na produção.');
    expect(joined[1].text).toBe(
      'O dashboard onde tem as métricas quebrou e eu queria que o Mateus corrigisse isso. É um problema provavelmente no front-end, e no back-end a gente tem um erro, e esse erro precisa ser corrigido pelo Danilo.',
    );
    expect(joined[1].start).toBe(6);
    expect(joined[1].end).toBe(24);
  });

  it('keeps separate sentences from different speakers', () => {
    const joined = joinBrokenSegments([
      segment({ id: 'seg-0', start: 0, end: 4, text: 'Primeira fala.' }),
      segment({
        id: 'seg-1',
        speakerId: 'spk-2',
        speakerName: 'Speaker 2',
        start: 5,
        end: 9,
        text: 'Segunda fala.',
      }),
    ]);

    expect(joined).toHaveLength(2);
  });
});
