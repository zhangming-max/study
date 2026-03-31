import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('smoke', () => {
  it('renders app root', () => {
    render(<App />)
    expect(screen.getByText(/狼人杀/i)).toBeInTheDocument()
  })
})

