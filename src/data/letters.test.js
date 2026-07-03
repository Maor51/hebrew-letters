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
})
