import letters from './letters.json'

describe('letters.json', () => {
  it('has exactly 22 entries', () => {
    expect(letters).toHaveLength(22)
  })

  it('each entry has all required fields with correct formats', () => {
    const VALID_COLORS = ['#FFB347', '#98D8C8', '#B5A7D5', '#FF8FAB', '#95E1D3']
    letters.forEach((l) => {
      expect(typeof l.id).toBe('string')
      expect(l.id.length).toBeGreaterThan(0)
      expect(typeof l.letter).toBe('string')
      expect(typeof l.name).toBe('string')
      expect(typeof l.word).toBe('string')
      expect(l.imagePath).toMatch(/^\/images\//)
      expect(l.audioLetterPath).toMatch(/^\/audio\//)
      expect(l.audioWordPath).toMatch(/^\/audio\/word-/)
      expect(VALID_COLORS).toContain(l.color)
    })
  })

  it('all ids are unique', () => {
    const ids = letters.map((l) => l.id)
    expect(new Set(ids).size).toBe(22)
  })

  it('starts with alef and ends with tav', () => {
    expect(letters[0].id).toBe('alef')
    expect(letters[21].id).toBe('tav')
  })

  it('each letter field contains Hebrew Unicode characters', () => {
    const hebrewRange = /[א-ת]/
    letters.forEach((l) => {
      expect(l.letter).toMatch(hebrewRange)
      expect(l.name).toMatch(hebrewRange)
      expect(l.word).toMatch(hebrewRange)
    })
  })

  it('each word starts with the correct Hebrew letter', () => {
    // Strip nikud (Hebrew combining characters U+0591-U+05C7) before comparing
    const stripNikud = (str) => str.replace(/[֑-ׇ]/g, '')
    letters.forEach((l) => {
      const firstChar = stripNikud(l.word)[0]
      expect(firstChar).toBe(l.letter)
    })
  })
})
