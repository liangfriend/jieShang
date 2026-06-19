/** virtualPiano 音名显示工具（自 deciphony-core 精简，避免未发布包导致构建失败） */

export enum AccidentalEnum {
  None = '',
  Natural = '&',
  Sharp = '#',
  Flat = 'b',
  DoubleSharp = '##',
  DoubleFlat = 'bb'
}

export type NoteLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

export type NoteName = {
  letter: NoteLetter
  accidental: AccidentalEnum
  octave: number
}

export function midiToNoteName(
  midi: number,
  priority: AccidentalEnum.Sharp | AccidentalEnum.Flat = AccidentalEnum.Sharp
): NoteName {
  const pitchIndex = ((midi % 12) + 12) % 12
  const octave = Math.floor(midi / 12) - 1
  const pitchMap =
    priority === AccidentalEnum.Sharp
      ? ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
      : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
  const str = pitchMap[pitchIndex]!
  return {
    letter: str[0] as NoteLetter,
    accidental: (str[1] === '#' ? AccidentalEnum.Sharp : str[1] === 'b' ? AccidentalEnum.Flat : AccidentalEnum.None),
    octave
  }
}

export function noteNameToNoteString(noteName: NoteName): string {
  return `${noteName.letter}${noteName.accidental}${noteName.octave}`
}

export function noteNameToHelmholtz(noteName: NoteName): string {
  const { letter, accidental, octave } = noteName

  let accidentalSymbol = ''
  switch (accidental) {
    case AccidentalEnum.Sharp:
      accidentalSymbol = '♯'
      break
    case AccidentalEnum.Flat:
      accidentalSymbol = '♭'
      break
    case AccidentalEnum.DoubleSharp:
      accidentalSymbol = '𝄪'
      break
    case AccidentalEnum.DoubleFlat:
      accidentalSymbol = '𝄫'
      break
    default:
      accidentalSymbol = ''
  }

  const superscriptMap: Record<number, string> = {
    0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹'
  }
  const subscriptMap: Record<number, string> = {
    0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉'
  }

  let noteSymbol = ''

  if (octave <= 2) {
    noteSymbol = letter.toUpperCase()
    const digits = String(Math.abs(octave - 3))
      .split('')
      .map((d) => subscriptMap[Number(d)]!)
      .join('')
    noteSymbol += digits
  } else {
    noteSymbol = letter.toLowerCase()
    if (octave >= 4) {
      const upperNum = octave - 3
      const digits = String(upperNum)
        .split('')
        .map((d) => superscriptMap[Number(d)]!)
        .join('')
      noteSymbol += digits
    }
  }

  return noteSymbol.slice(0, 1) + accidentalSymbol + noteSymbol.slice(1)
}
